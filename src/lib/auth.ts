import { Resend } from 'resend';
import pkg from 'pg';
import { betterAuth } from '@atomrigslab/better-auth';
import { bearer, customSession, jwt, openAPI } from '@atomrigslab/better-auth/plugins';
import { GOOGLE_CLIENT_SECRET, RESEND_API_KEY, BETTER_AUTH_SECRET, DATABASE_URL, TRUSTED_ORIGINS } from '$env/static/private';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { pga, mobile, siwe, oAuthLink, emailOTP } from './plugins';

const { Pool } = pkg;
export const db = new Pool({
	connectionString: DATABASE_URL
});

const origins = TRUSTED_ORIGINS
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin !== '');

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
	// trustedOrigins: ['chrome-extension://dgoifpeldfmnlbangejfelgmgibpokej', 'http://localhost:3000', 'http://0.0.0.0:3000'],
	trustedOrigins: origins,
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
