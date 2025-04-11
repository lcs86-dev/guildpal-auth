import type { BetterAuthClientPlugin } from '@atomrigslab/better-auth';
import type { emailOTP } from '.';

export const emailOTPClient = () => {
	return {
		id: 'email-otp',
		$InferServerPlugin: {} as ReturnType<typeof emailOTP>
	} satisfies BetterAuthClientPlugin;
};
