// import { betterAuth } from 'better-auth';
// import { openAPI } from 'better-auth/plugins';

import { betterAuth } from '@atomrigslab/better-auth';
import { openAPI } from '@atomrigslab/better-auth/plugins';

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
		autoSignIn: false //defaults to true
	},
	plugins: [openAPI()]
});
