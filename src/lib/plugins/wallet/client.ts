import type { BetterAuthClientPlugin } from '@atomrigslab/better-auth';
import type { siwe } from './';

type SignInWithEthereumPlugin = typeof siwe;

export const siweClientPlugin = () => {
	return {
		id: 'siwe',
		$InferServerPlugin: {} as ReturnType<SignInWithEthereumPlugin>
	} satisfies BetterAuthClientPlugin;
};
