import { Resend } from 'resend';
import pkg from 'pg';
import { betterAuth } from '@atomrigslab/better-auth';
import { bearer, customSession, jwt, openAPI } from '@atomrigslab/better-auth/plugins';
import { GOOGLE_CLIENT_SECRET, RESEND_API_KEY, BETTER_AUTH_SECRET, DATABASE_URL, TRUSTED_ORIGINS } from '$env/static/private';
import { PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_AUTH_SERVICE_ORIGIN } from '$env/static/public';
import { pga, mobile, siwe, oAuthLink, emailOTP } from './plugins';

const { Pool } = pkg;

// Production-ready database pool configuration
export const db = new Pool({
	connectionString: DATABASE_URL,
	// ssl: process.env.NODE_ENV === 'production' 
	// 	? { rejectUnauthorized: true } // Enforce SSL in production
	// 	: false,
	max: 20, // Maximum number of clients in the pool
	idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
	connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection cannot be established
	maxUses: 7500, // Close and replace a connection after it has been used 7500 times
});

// Error handling for the pool
db.on('error', (err) => {
	console.error('Unexpected error on idle client', err);
	process.exit(-1);
});

// Connection verification
db.on('connect', (client) => {
	console.log('New client connected to database');
});

// Handle application shutdown gracefully
const closeDbAndExit = async () => {
	console.log('Closing database pool...');
	await db.end();
	console.log('Database pool closed');
	process.exit(0);
};

// Attach shutdown handlers
process.on('SIGTERM', closeDbAndExit);
process.on('SIGINT', closeDbAndExit);

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
		},
		expiresIn: 60 * 60 * 24 * 1 // 1 day
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
		siwe({ domain: PUBLIC_AUTH_SERVICE_ORIGIN }),
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
		jwt({
			jwt: {
				expirationTime: '1d'
			},
		}),
		mobile(),
		oAuthLink(),
		customSession(async ({ user, session }) => {
			// Run all database queries concurrently rather than sequentially
			const [midsResult, walletsResult, accountsResult] = await Promise.all([
				db.query('SELECT mid FROM pga WHERE "userId" = $1', [user.id]),
				db.query('SELECT * FROM wallet WHERE "userId" = $1', [user.id]),
				db.query('SELECT * FROM account WHERE "userId" = $1', [user.id])
			]);
		
			// Extract only the mid field directly instead of mapping afterward
			const mids = midsResult.rows.map(row => row.mid);
			
			return {
				user,  // No need to spread if returning the entire object
				session,
				mids,
				wallets: walletsResult.rows,
				accounts: accountsResult.rows
			};
		})
	]
});
