// // import { betterAuth } from 'better-auth';
// // import { openAPI } from 'better-auth/plugins';

// import { betterAuth } from '@atomrigslab/better-auth';
// import { openAPI } from '@atomrigslab/better-auth/plugins';

// export const auth = betterAuth({
// 	emailAndPassword: {
// 		enabled: true,
// 		autoSignIn: false //defaults to true
// 	},
// 	plugins: [openAPI()]
// });

// import { betterAuth } from "better-auth";
// import { bearer, openAPI, customSession, jwt } from "better-auth/plugins";
import { Resend } from 'resend';
// import { emailOTP, siwe } from "@/lib/plugins";
// import { pga } from "./plugins/pga";
import pkg from 'pg';
import { betterAuth } from '@atomrigslab/better-auth';
import { siwe } from './plugins/wallet';
import { bearer, customSession, emailOTP, jwt, openAPI } from '@atomrigslab/better-auth/plugins';
// import { mobile } from "./plugins/mobile";

import { GOOGLE_CLIENT_SECRET, RESEND_API_KEY } from '$env/static/private';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { pga } from './plugins/pga';
import { mobile } from './plugins/mobile';

const { Pool } = pkg;
export const db = new Pool({
	connectionString: 'postgres://user:password@localhost:5432/database'
});

export const auth = betterAuth({
	appName: 'Better Auth Demo',
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60 // Cache duration in seconds
		}
		// modelName: "auth_session",
	},
	user: {
		changeEmail: {
			enabled: true
		}
		// modelName: "auth_user",
	},
	account: {
		accountLinking: {
			trustedProviders: ['google']
		}
		// modelName: "auth_account",
	},
	// verification: {
	// modelName: "auth_verification",
	// },
	// jwks: {
	// modelName: "auth_jwks",
	// },
	database: db,
	trustedOrigins: ['chrome-extension://dgoifpeldfmnlbangejfelgmgibpokej', 'http://localhost:3000'],
	socialProviders: {
		google: {
			clientId: PUBLIC_GOOGLE_CLIENT_ID || '',
			clientSecret: GOOGLE_CLIENT_SECRET || ''
			// disableImplicitSignUp: true,
		}
	},
	onAPIError: {
		onError: (e) => {
			console.log('auth.ts onAPIError onError');
			console.error(e);
		}
	},
	plugins: [
		siwe({ domain: 'https://guildpal.com' }),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				const resend = new Resend(RESEND_API_KEY);
				await resend.emails.send({
					from: 'onboarding@resend.dev',
					to: email,
					subject: 'Verify your email address',
					text: `Click the link to verify otp: ${otp}`
				});
			}
			// disableSignUp: true,
		}),
		pga(),
		bearer(),
		openAPI(),
		jwt(),
		mobile(),
		customSession(async ({ user, session }) => {
			const mids = (await db.query('SELECT * FROM pga WHERE "userId" = $1', [user.id])).rows;
			const wallets = (await db.query('SELECT * FROM wallet WHERE "userId" = $1', [user.id])).rows;
			const accounts = (await db.query('SELECT * FROM account WHERE "userId" = $1', [user.id]))
				.rows;
			return {
				user: {
					...user
				},
				session,
				mid: mids,
				wallet: wallets,
				account: accounts
			};
		})
	]
});
