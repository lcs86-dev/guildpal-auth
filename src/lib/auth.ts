import { Resend } from 'resend';
import pkg from 'pg';
import { betterAuth } from '@atomrigslab/better-auth';
import { bearer, customSession, jwt, openAPI } from '@atomrigslab/better-auth/plugins';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { pga, mobile, siwe, oAuthLink, emailOTP } from './plugins';

const { Pool } = pkg;

// Production-ready database pool configuration
export const db = new Pool({
	connectionString: privateEnv.DATABASE_URL,
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

const origins = privateEnv.TRUSTED_ORIGINS
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin !== '');

export const auth = betterAuth({
	appName: 'Guildpal',
	secret: privateEnv.BETTER_AUTH_SECRET,
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
			clientId: publicEnv.PUBLIC_GOOGLE_CLIENT_ID || '',
			clientSecret: privateEnv.GOOGLE_CLIENT_SECRET || '',
		}
	},
	onAPIError: {
		onError: (e) => {
			console.log('auth.ts onAPIError onError');
			console.error(e);
		},
	},
	plugins: [
		siwe({ domain: publicEnv.PUBLIC_AUTH_SERVICE_ORIGIN }),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				const resend = new Resend(privateEnv.RESEND_API_KEY);
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
