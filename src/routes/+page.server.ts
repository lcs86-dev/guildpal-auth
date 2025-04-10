import { API_KEY } from '$env/static/private';
import { PUBLIC_CLIENT_ID } from '$env/static/public';

export async function load() {
	console.log('API_KEY', API_KEY);
	console.log('PUBLIC_CLIENT_ID', PUBLIC_CLIENT_ID);
}
