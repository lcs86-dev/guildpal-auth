import { createAuthClient } from '@atomrigslab/better-auth/svelte';
import { customSessionClient } from '@atomrigslab/better-auth/client/plugins';
import { siweClientPlugin } from './plugins/wallet/client';
import { emailOTPClient } from './plugins/email-otp/client';
import { pgaClientPlugin } from './plugins/pga/client';
import type { auth } from './auth';
import { PUBLIC_AUTH_SERVICE_ORIGIN } from '$env/static/public';

export const client = createAuthClient({
	baseURL: PUBLIC_AUTH_SERVICE_ORIGIN,
	plugins: [
		emailOTPClient(),
		siweClientPlugin(),
		pgaClientPlugin(),
		customSessionClient<typeof auth>()
	],
	fetchOptions: {
		onError(e) {
			if (e.error.status === 429) {
				// toast.error("Too many requests. Please try again later.");
				console.error('Too many requests. Please try again later.');
			}
		}
	}
});

export const { signUp, signIn, signOut, useSession, linkSocial, updateUser, emailOtp, pga } =
	client;

client.$store.listen('$sessionSignal', async () => {});
