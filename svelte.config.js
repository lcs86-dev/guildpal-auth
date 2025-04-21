// import adapter from '@sveltejs/adapter-node';
import adapter from '@sveltejs/adapter-cloudflare';
// import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		// adapter: adapter({
		// 	runtime: 'nodejs20.x',
		// }),
		adapter: adapter(),
		// paths: {
		// 	base: '/auth',
		// 	relative: false
		// }
	}
};

export default config;
