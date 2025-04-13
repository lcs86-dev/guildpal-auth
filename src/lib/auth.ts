import { Resend } from 'resend';
import pkg from 'pg';
import { betterAuth } from '@atomrigslab/better-auth';
import { bearer, customSession, emailOTP, jwt, openAPI } from '@atomrigslab/better-auth/plugins';
import { GOOGLE_CLIENT_SECRET, RESEND_API_KEY, BETTER_AUTH_SECRET } from '$env/static/private';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { pga, mobile, siwe, oAuthLink } from './plugins';

const { Pool } = pkg;
export const db = new Pool({
	connectionString: 'postgres://user:password@localhost:5432/database'
});

export const auth = betterAuth({
	appName: 'Guildpal',
	secret: BETTER_AUTH_SECRET,
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60 // Cache duration in seconds
		}
	},
	user: {
		changeEmail: {
			enabled: true
		}
	},
	account: {
		accountLinking: {
			trustedProviders: ['google']
		}
	},
	database: db,
	trustedOrigins: ['chrome-extension://dgoifpeldfmnlbangejfelgmgibpokej', 'http://localhost:3000'],
	socialProviders: {
		google: {
			clientId: PUBLIC_GOOGLE_CLIENT_ID || '',
			clientSecret: GOOGLE_CLIENT_SECRET || '',
		}
	},
	onAPIError: {
		onError: (e) => {
			console.log('auth.ts onAPIError onError');
			console.error(e);
		},
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
		}),
		pga(),
		bearer(),
		openAPI(),
		jwt(),
		mobile(),
		oAuthLink(),
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
