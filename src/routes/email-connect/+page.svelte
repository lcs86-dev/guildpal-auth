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
	<div class="bg-[#1A1A1A] rounded-xl shadow p-6 relative">
		<!-- Back button -->
		<button
			class="absolute left-4 top-4 text-[#A1A1AA] hover:text-white transition"
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
		<h2 class="text-center text-white text-xl font-medium mb-8 mt-2">Connect E-mail</h2>

		<!-- Form -->
		<div class="space-y-5">
			<!-- Email input with verify button -->
			<div class="relative">
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="Please enter your email."
					class="w-full p-3.5 pl-4 rounded-xl bg-[#262626] border border-[#333333] text-white focus:outline-none focus:ring-2 focus:ring-[#4CAF50] pr-32 text-base"
				/>
				<button
					type="button"
					on:click={handleVerifyEmail}
					class="absolute right-2.5 top-2 bottom-2 px-4 rounded-lg bg-[#333333] text-white text-sm hover:bg-[#404040] transition"
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
				class="w-full p-3.5 pl-4 rounded-xl bg-[#262626] border border-[#333333] text-white focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-base"
			/>

			<!-- Connect button -->
			<button
				on:click={handleConnect}
				class="w-full py-3.5 rounded-xl bg-[#4CAF50] text-white font-medium hover:opacity-90 transition mt-4 text-base"
			>
				Connect
			</button>
		</div>
	</div>
</div>
