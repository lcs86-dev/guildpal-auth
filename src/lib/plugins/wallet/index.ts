// Zod
import { z } from 'zod';

// SIWE deps
import { SiweMessage, generateNonce } from 'siwe';
import { createAuthEndpoint, ERROR_CODES } from '@atomrigslab/better-auth/plugins';
import { generateId, type BetterAuthPlugin } from '@atomrigslab/better-auth';
import { setSessionCookie } from '@atomrigslab/better-auth/cookies';
import { getSessionFromCtx, APIError } from '@atomrigslab/better-auth/api';
import { db } from '$lib/auth';

export interface SIWEPluginOptions {
	domain: string;
	// Optional configuration
	chainId?: 1 | 11155111 | undefined;
	version?: string;
	resources?: string[];
}

export const siwe = (options: SIWEPluginOptions) =>
	({
		id: 'siwe',
		schema: {
			wallet: {
				fields: {
					userId: {
						type: 'string',
						required: true
					},
					name: {
						type: 'string',
						required: true
					},
					address: {
						type: 'string',
						required: true
					},
					createdAt: {
						type: 'date'
					},
					updatedAt: {
						type: 'date'
					}
				}
			}
		},
		endpoints: {
			nonce: createAuthEndpoint(
				'/sign-in/nonce',
				{
					method: 'POST',
					body: z.object({
						address: z.string()
					})
				},
				async (ctx) => {
					const nonce = generateNonce();
					// Store nonce with 15-minute expiration
					await ctx.context.internalAdapter.createVerificationValue({
						id: generateId(),
						identifier: `siwe_${ctx.body.address.toLowerCase()}`,
						value: nonce,
						expiresAt: new Date(Date.now() + 15 * 60 * 1000)
					});

					return { nonce };
				}
			),
			verify: createAuthEndpoint(
				'/sign-in/verify',
				{
					method: 'POST',
					body: z.object({
						message: z.string(),
						signature: z.string(),
						address: z.string(),
						walletName: z.string()
					})
				},
				async (ctx) => {
					const { message, signature, walletName } = ctx.body;
					const siweMessage = new SiweMessage(message);

					try {
						const verification = await ctx.context.internalAdapter.findVerificationValue(
							`siwe_${ctx.body.address.toLowerCase()}`
						);
						if (!verification || new Date() > verification.expiresAt) {
							throw new APIError('UNAUTHORIZED', {
								message: 'Unauthorized: Invalid or expired nonce'
							});
						}
						const verified = await siweMessage.verify({
							signature,
							nonce: verification.value
						});
						if (!verified.success) {
							throw new APIError('UNAUTHORIZED', {
								message: 'Unauthorized: Invalid SIWE signature'
							});
						}

						// Delete used nonce to prevent replay attacks
						// now moved to n after hook on /sign-out route
						await ctx.context.internalAdapter.deleteVerificationValue(verification.id);

						const wallet = (
							await db.query('SELECT * FROM wallet WHERE address = $1', [ctx.body.address])
						).rows[0];

						let user = undefined;
						if (!wallet) {
							const tempEmail = `${ctx.body.address}@guildpal.com`;

							user = await ctx.context.internalAdapter.createUser({
								name: ctx.body.address,
								email: tempEmail,
								address: ctx.body.address,
								avatar: ''
							});

							const id = generateId();
							const now = new Date().toISOString();
							await db.query(
								'INSERT INTO wallet (id, "userId", name, address, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
								[id, user.id, walletName, ctx.body.address, now, now]
							);
						} else {
							user = (await db.query('SELECT * FROM "user" WHERE id = $1', [wallet.userId]))
								.rows[0];
						}

						const session = await ctx.context.internalAdapter.createSession(user?.id, ctx.request);
						await setSessionCookie(ctx, { session, user });

						return ctx.json({ token: session.token });
					} catch (error: any) {
						console.log('error message', error.message);
						if (error instanceof APIError) throw error;
						throw new APIError('UNAUTHORIZED', {
							message: 'Something went wrong. Please try again later.',
							error: error.message
						});
					}
				}
			),

			link: createAuthEndpoint(
				'/sign-in/wallet-link',
				{
					method: 'POST',
					body: z.object({
						message: z.string(),
						signature: z.string(),
						address: z.string(),
						walletName: z.string()
					})
				},
				async (ctx) => {
					const { message, signature } = ctx.body;
					const siweMessage = new SiweMessage(message);

					try {
						const verification = await ctx.context.internalAdapter.findVerificationValue(
							`siwe_${ctx.body.address.toLowerCase()}`
						);
						if (!verification || new Date() > verification.expiresAt) {
							throw new APIError('UNAUTHORIZED', {
								message: 'Unauthorized: Invalid or expired nonce'
							});
						}
						const verified = await siweMessage.verify({
							signature,
							nonce: verification.value
						});
						if (!verified.success) {
							throw new APIError('UNAUTHORIZED', {
								message: 'Unauthorized: Invalid SIWE signature'
							});
						}

						const existingSession = await getSessionFromCtx(ctx);
						if (!existingSession) {
							throw new APIError('BAD_REQUEST', {
								message: ERROR_CODES.UNAUTHORIZED_SESSION
							});
						}

						const userId = existingSession.user.id;

						// Check if the wallet address already exists
						const existingWallet = (
							await db.query('SELECT * FROM wallet WHERE address = $1', [ctx.body.address])
						).rows[0];
						
						if (existingWallet) {
							// If wallet exists but belongs to another user
							if (existingWallet.userId !== userId) {
								throw new APIError('BAD_REQUEST', {
									message: 'This wallet address is already linked to another account'
								});
							}
							// If wallet exists and belongs to current user
							throw new APIError('BAD_REQUEST', {
								message: 'This wallet address is already linked to your account'
							});
						}

						const id = generateId();
						const now = new Date().toISOString();
						await db.query(
							'INSERT INTO wallet (id, "userId", name, address, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
							[id, userId, ctx.body.walletName, ctx.body.address, now, now]
						);

						const session = await ctx.context.internalAdapter.createSession(userId, ctx.request);

						if (ctx.context.session) {
							await ctx.context.internalAdapter.deleteSession(
								ctx.context.session.session.token,
							);
						}

						await setSessionCookie(ctx, {
							session,
							user: existingSession.user
						});

						return ctx.json({ token: session.token });
					} catch (error: any) {
						console.log('error', error);
						if (error instanceof APIError) throw error;
						throw new APIError('UNAUTHORIZED', {
							message: 'Something went wrong. Please try again later.',
							error: error.message
						});
					}
				}
			)
		}
	}) satisfies BetterAuthPlugin;
