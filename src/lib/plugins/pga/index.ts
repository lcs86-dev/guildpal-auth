import { db } from '$lib/auth';
import { decrypt } from '$lib/cryptoUtils';
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
					let mid = '';
					try {
						mid = decrypt(ctx.body.encryptedMid)
					} catch (error) {
						console.error('Failed to decrypt MID:', error);
						return { success: false, message: 'Failed to decrypt MID' };
					}

					try {
						const existingSession = await getSessionFromCtx(ctx);
						if (!existingSession) {
							throw new APIError("BAD_REQUEST", {
								message: ERROR_CODES.UNAUTHORIZED_SESSION,
							});
						}

						const id = generateId();
						const userId = existingSession.user.id;

						// Check if MID already exists
						const pga = (
							await db.query('SELECT * FROM pga WHERE mid = $1', [mid])
						).rows;

						// Check if this MID is already linked to any account
						if (pga.length > 0) {
							// Check if it's linked to current user
							const myPga = pga.find((p) => p.userId === userId);
							if (myPga) {
								return { success: true, message: 'MID already linked to your account' };
							} else {
								return { success: false, message: 'MID already linked to another account' };
							}
						}

						// Insert the new PGA entry
						const now = new Date().toISOString();
						await db.query(
							'INSERT INTO pga (id, "userId", mid, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5)',
							[
								id,
								userId,
								mid,
								now,
								now
							]
						);

						return { success: true, message: 'MID successfully linked to your account' };
					} catch (error) {
						console.error('Error adding MID:', error);
						if (error instanceof APIError) {
							throw error;
						}
						return { success: false, message: 'Failed to link MID to your account' };
					}
				}
			),
		}
	} satisfies BetterAuthPlugin;
};
