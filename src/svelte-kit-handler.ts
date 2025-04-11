import type { BetterAuthOptions } from '@atomrigslab/better-auth';

export const toSvelteKitHandler = (auth: {
	handler: (request: Request) => any;
	options: BetterAuthOptions;
}) => {
	return (event: { request: Request }) => auth.handler(event.request);
};

export const svelteKitHandler = async ({
	auth,
	event,
	resolve
}: {
	auth: {
		handler: (request: Request) => any;
		options: BetterAuthOptions;
	};
	event: { request: Request; url: URL };
	resolve: (event: any) => any;
}) => {
	//@ts-expect-error
	const { building } = await import('$app/environment').catch((e) => {}).then((m) => m || {});

	if (building) {
		return resolve(event);
	}

	const { request, url } = event;

	// Handle preflight OPTIONS requests
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
				'Access-Control-Allow-Origin': 'http://localhost:3000',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Access-Control-Allow-Credentials': 'true'
			}
		});
	}

	if (isAuthPath(url.toString(), auth.options)) {
		const authResponse = await auth.handler(request);

		// Add CORS headers to auth responses
		authResponse.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
		authResponse.headers.set('Access-Control-Allow-Credentials', 'true');

		return authResponse;
	}

	const response = await resolve(event);

	// Add CORS headers to all other responses
	response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
	response.headers.set('Access-Control-Allow-Credentials', 'true');

	return response;
};

export function isAuthPath(url: string, options: BetterAuthOptions) {
	const _url = new URL(url);
	const baseURL = new URL(`${options.baseURL || _url.origin}${options.basePath || '/api/auth'}`);
	if (_url.origin !== baseURL.origin) return false;
	if (
		!_url.pathname.startsWith(
			baseURL.pathname.endsWith('/') ? baseURL.pathname : `${baseURL.pathname}/`
		)
	)
		return false;
	return true;
}
