import type { BetterAuthClientPlugin } from '@atomrigslab/better-auth';
import type { oAuthLink } from '.';

export const oauthLinkClient = () => {
	return {
		id: 'oauth-link',
		$InferServerPlugin: {} as ReturnType<typeof oAuthLink>
	} satisfies BetterAuthClientPlugin;
};
