import { auth } from './lib/auth';
import { svelteKitHandler } from './svelte-kit-handler';

export async function handle({ event, resolve }) {
	return svelteKitHandler({ event, resolve, auth });
}
