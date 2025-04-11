import { db } from '$lib/auth';
import { generateId, type BetterAuthPlugin } from '@atomrigslab/better-auth';
import { getSessionFromCtx, APIError } from '@atomrigslab/better-auth/api';
import { createAuthEndpoint, ERROR_CODES } from '@atomrigslab/better-auth/plugins';
import { z } from 'zod';

export const pga = () => {
	return {
		id: 'pga',
		schema: {
			pga: {
				modelName: 'pga',
				fields: {
					userId: {
						type: 'string',
						required: true
					},
					mid: {
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
			addMid: createAuthEndpoint(
				'/pga/add-mid',
				{
					method: 'POST',
					body: z.object({
						encryptedMid: z.string()
					})
				},
				async (ctx) => {
					try {
						// TODO: decode mid
						const mid = ctx.body.encryptedMid;
						const id = generateId();
						const existingSession = await getSessionFromCtx(ctx);
						if (!existingSession) {
							throw new APIError('BAD_REQUEST', {
								message: ERROR_CODES.UNAUTHORIZED_SESSION
							});
						}
						const userId = existingSession.user.id;
						const pga = (await db.query('SELECT * FROM pga WHERE mid = $1', [mid])).rows;
						const myPga = pga.find((p) => p.mid === mid);
						if (myPga) {
							return;
						}
					} catch (error) {
						console.error(error);
					}
				}
			),
			getUserByMid: createAuthEndpoint(
				'/pga/get-user-by-mid',
				{
					method: 'GET'
				},
				async (ctx) => {
					const mid = ctx?.query?.encryptedMid;
					const pga = (await db.query('SELECT * FROM pga WHERE mid = $1', [mid])).rows[0];
					if (!pga) {
						return { user: null, accounts: [] };
					}
					const userId = pga?.userId;
					const user = (await db.query('SELECT * FROM user WHERE id = $1', [userId])).rows[0];
					const accounts = await ctx.context.internalAdapter.findAccounts(userId);

					return { user, accounts };
				}
			)
		}
	} satisfies BetterAuthPlugin;
};
