<!-- src/routes/success/+page.svelte -->
<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let email = '';

	onMount(() => {
		// Get email from query parameters or use a default
		email = $page.url.searchParams.get('email') || 'PGA123@gmail.com';
	});

	function handleConfirm() {
		// Logic to handle confirm action (e.g., close window or redirect)
		window.location.href = '/';
	}
</script>

<div class="w-full max-w-md">
	<div class="bg-gray-800/90 rounded-xl shadow-xl p-8 flex flex-col items-center">
		<!-- Green checkmark icon -->
		<div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-10 w-10 text-white"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>

		<!-- Success message -->
		<div class="text-center mb-6">
			<h2 class="text-lg text-white mb-1">You have successfully logged in.</h2>
			<p class="text-gray-300">Clicking 'Confirm' will close the window.</p>
		</div>

		<!-- Email badge -->
		<div class="bg-green-500/20 text-green-400 px-6 py-2 rounded-full mb-8 text-sm">
			{email}
		</div>

		<!-- Confirm button -->
		<button
			on:click={handleConfirm}
			class="w-full p-3 rounded-md bg-green-500 text-white font-medium hover:bg-green-600 transition"
		>
			Confirm
		</button>
	</div>
</div>
