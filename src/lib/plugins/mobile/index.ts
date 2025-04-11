import { APIError } from '@atomrigslab/better-auth/api';
import { BASE_ERROR_CODES, handleOAuthUserInfo } from '@atomrigslab/better-auth';
import { createAuthEndpoint, type BetterAuthPlugin } from '@atomrigslab/better-auth/plugins';
import { z } from 'zod';
import { PUBLIC_MOBILE_GOOGLE_CLIENT_ID } from '$env/static/public';
import { setSessionCookie } from '@atomrigslab/better-auth/cookies';

export const mobile = () =>
	({
		id: 'mobile',
		endpoints: {
			mobileSocialSignIn: createAuthEndpoint(
				'/sign-in/social-mobile',
				{
					method: 'POST',
					body: z.object({
						provider: z.any(),
						idToken: z.object({
							token: z.string({
								description: 'ID token from the provider'
							}),
							accessToken: z
								.string({
									description: 'Access token from the provider'
								})
								.optional(),
							refreshToken: z
								.string({
									description: 'Refresh token from the provider'
								})
								.optional()
						})
					}),
					metadata: {
						openapi: {
							description: 'Sign in with a social provider',
							responses: {
								'200': {
									description: 'Success',
									content: {
										'application/json': {
											schema: {
												type: 'object',
												properties: {
													token: {
														type: 'string'
													},
													user: {
														type: 'object',
														ref: '#/components/schemas/User'
													},
													url: {
														type: 'string'
													},
													redirect: {
														type: 'boolean'
													}
												},
												required: ['redirect']
											}
										}
									}
								}
							}
						}
					}
				},
				async (c) => {
					const provider = c.context.socialProviders.find((p) => p.id === c.body.provider);
					if (!provider) {
						c.context.logger.error(
							'Provider not found. Make sure to add the provider in your auth config',
							{
								provider: c.body.provider
							}
						);
						throw new APIError('NOT_FOUND', {
							message: BASE_ERROR_CODES.PROVIDER_NOT_FOUND
						});
					}

					if (!c.body.idToken) {
						c.context.logger.error('IdToken not found. Make sure to add the idToken', {
							provider: c.body.provider
						});
						throw new APIError('NOT_FOUND', {
							message: BASE_ERROR_CODES.INVALID_TOKEN
						});
					}

					if (!provider.verifyIdToken) {
						c.context.logger.error('Provider does not support id token verification', {
							provider: c.body.provider
						});
						throw new APIError('NOT_FOUND', {
							message: BASE_ERROR_CODES.ID_TOKEN_NOT_SUPPORTED
						});
					}
					const { token, nonce } = c.body.idToken;
					const valid = await provider.verifyIdToken(
						token,
						nonce,
						PUBLIC_MOBILE_GOOGLE_CLIENT_ID
						// '104874438001-nddsi91qigg7hp9gk49rqopmgnp5kpr7.apps.googleusercontent.com'
					);
					if (!valid) {
						c.context.logger.error('Invalid id token', {
							provider: c.body.provider
						});
						throw new APIError('UNAUTHORIZED', {
							message: BASE_ERROR_CODES.INVALID_TOKEN
						});
					}
					const userInfo = await provider.getUserInfo({
						idToken: token,
						accessToken: c.body.idToken.accessToken,
						refreshToken: c.body.idToken.refreshToken
					});
					if (!userInfo || !userInfo?.user) {
						c.context.logger.error('Failed to get user info', {
							provider: c.body.provider
						});
						throw new APIError('UNAUTHORIZED', {
							message: BASE_ERROR_CODES.FAILED_TO_GET_USER_INFO
						});
					}
					if (!userInfo.user.email) {
						c.context.logger.error('User email not found', {
							provider: c.body.provider
						});
						throw new APIError('UNAUTHORIZED', {
							message: BASE_ERROR_CODES.USER_EMAIL_NOT_FOUND
						});
					}
					const data = await handleOAuthUserInfo(c, {
						userInfo: {
							email: userInfo.user.email,
							id: userInfo.user.id,
							name: userInfo.user.name || '',
							image: userInfo.user.image,
							emailVerified: userInfo.user.emailVerified || false
						},
						account: {
							providerId: provider.id,
							accountId: userInfo.user.id,
							accessToken: c.body.idToken.accessToken
						},
						disableSignUp:
							(provider.disableImplicitSignUp && !c.body.requestSignUp) || provider.disableSignUp
					});
					if (data.error) {
						throw new APIError('UNAUTHORIZED', {
							message: data.error
						});
					}
					await setSessionCookie(c, data.data!);
					return c.json({
						redirect: false,
						token: data.data!.session.token,
						url: undefined,
						user: {
							id: data.data!.user.id,
							email: data.data!.user.email,
							name: data.data!.user.name,
							image: data.data!.user.image,
							emailVerified: data.data!.user.emailVerified,
							createdAt: data.data!.user.createdAt,
							updatedAt: data.data!.user.updatedAt
						}
					});
				}
			)
		}
	}) satisfies BetterAuthPlugin;
