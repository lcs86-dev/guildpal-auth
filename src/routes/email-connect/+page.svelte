<!-- src/routes/email-connect/+page.svelte -->
<script>
	import { onMount } from 'svelte';

	let email = '';
	let code = '';

	function handleVerifyEmail() {
		// Logic to verify email would go here
		console.log('Verifying email:', email);
	}

	function handleConnect() {
		// Logic to connect email would go here
		console.log('Connecting with:', { email, code });
		window.location.href = '/account';
	}

	function goBack() {
		// Navigate back to previous page
		window.history.back();
	}
</script>

<div class="w-full max-w-md">
	<div class="bg-gray-800/90 rounded-xl shadow-xl p-6 relative">
		<!-- Back button -->
		<button
			class="absolute left-4 top-4 text-gray-400 hover:text-gray-200 transition"
			on:click={goBack}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
		</button>

		<!-- Title -->
		<h2 class="text-center text-white text-xl mb-8 mt-2">E-mail connect</h2>

		<!-- Form -->
		<div class="space-y-4">
			<!-- Email input with verify button -->
			<div class="relative">
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="Please enter your email."
					class="w-full p-3 rounded-md bg-gray-700/70 border border-gray-600 text-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 pr-24"
				/>
				<button
					type="button"
					on:click={handleVerifyEmail}
					class="absolute right-1 top-1 bottom-1 px-3 rounded-md bg-gray-600 text-gray-200 text-sm hover:bg-gray-500 transition"
				>
					Verify Email
				</button>
			</div>

			<!-- Verification code input -->
			<input
				id="code"
				type="text"
				bind:value={code}
				placeholder="Enter Verification Code."
				class="w-full p-3 rounded-md bg-gray-700/70 border border-gray-600 text-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
			/>

			<!-- Connect button -->
			<button
				on:click={handleConnect}
				class="w-full p-3 rounded-md bg-green-500 text-white font-medium hover:bg-green-600 transition mt-4"
			>
				Connect
			</button>
		</div>
	</div>
</div>
