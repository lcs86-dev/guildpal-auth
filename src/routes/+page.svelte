<script>
	import { onMount } from 'svelte';

	let email = '';
	let code = '';
	let rememberMe = false;
	let autoLogin = false;

	function handleVerifyEmail() {
		// Logic to verify email would go here
		console.log('Verifying email:', email);
	}

	function handleSignIn() {
		// Logic to sign in would go here
		console.log('Signing in with:', { email, code, rememberMe, autoLogin });
	}
</script>

<div class="w-full max-w-md">
	<!-- Logo -->
	<div class="flex justify-center mb-6">
		<div class="flex flex-col items-center">
			<div
				class="h-12 w-12 rounded-full border-2 border-gray-200 flex items-center justify-center mb-2"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M12 2L4 8v8s0 4 8 4 8-4 8-4V8l-8-6z" />
					<path d="M12 6v12" />
					<path d="M12 6c-2.2 0-4 1.8-4 4" />
				</svg>
			</div>
			<h2 class="text-2xl font-bold text-gray-200">GuildPal</h2>
		</div>
	</div>

	<!-- Sign in text -->
	<p class="text-center text-gray-300 mb-8">Please enter your details to sign in your account.</p>

	<!-- Form -->
	<form class="space-y-4" on:submit|preventDefault={handleSignIn}>
		<!-- Email input with verify button -->
		<div class="relative">
			<input
				id="email"
				type="email"
				bind:value={email}
				placeholder="Please enter your email"
				class="w-full p-3 rounded-md bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 pr-24"
				required
			/>
			<button
				type="button"
				on:click={handleVerifyEmail}
				class="absolute right-1 top-1 bottom-1 px-3 rounded-md bg-gray-700 text-gray-200 text-sm hover:bg-gray-600 transition"
			>
				Verify Email
			</button>
		</div>

		<!-- Verification code input -->
		<input
			id="code"
			type="text"
			bind:value={code}
			placeholder="Enter Verification Code"
			class="w-full p-3 rounded-md bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
			required
		/>

		<!-- Checkboxes -->
		<div class="flex items-center justify-between text-sm text-gray-400">
			<label class="flex items-center space-x-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={rememberMe}
					class="rounded text-green-500 focus:ring-green-500 bg-gray-700 border-gray-600"
				/>
				<span>Remember Me</span>
			</label>

			<label class="flex items-center space-x-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={autoLogin}
					class="rounded text-green-500 focus:ring-green-500 bg-gray-700 border-gray-600"
				/>
				<span>Auto Login</span>
			</label>
		</div>

		<!-- Sign in button -->
		<button
			type="submit"
			class="w-full p-3 rounded-md bg-green-500 text-white font-medium hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
		>
			Sign in
		</button>
	</form>

	<!-- Divider -->
	<div class="flex items-center my-6">
		<div class="flex-1 h-px bg-gray-700"></div>
		<div class="px-4 text-sm text-gray-500">or</div>
		<div class="flex-1 h-px bg-gray-700"></div>
	</div>

	<!-- Social login buttons -->
	<div class="space-y-3">
		<button
			class="w-full p-3 rounded-md border border-gray-700 bg-gray-800/50 text-gray-200 font-medium flex items-center justify-center space-x-2 hover:bg-gray-700 transition"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24"
				><path
					d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
					fill="currentColor"
				/></svg
			>
			<span>Sign in with Google</span>
		</button>

		<button
			class="w-full p-3 rounded-md border border-gray-700 bg-gray-800/50 text-gray-200 font-medium flex items-center justify-center space-x-2 hover:bg-gray-700 transition"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24"
				><path
					d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9 21.59 18.03 20.37 19.6 18.55C21.17 16.72 22.04 14.4 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
					fill="currentColor"
				/></svg
			>
			<span>Sign in with Facebook</span>
		</button>

		<button
			class="w-full p-3 rounded-md border border-gray-700 bg-gray-800/50 text-gray-200 font-medium flex items-center justify-center space-x-2 hover:bg-gray-700 transition"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24"
				><path
					d="M12 12L8.5 8.5M12 12L15.5 8.5M12 12V17.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
					stroke="currentColor"
					fill="none"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/></svg
			>
			<span>Sign in with Ronin Wallet</span>
		</button>

		<button
			class="w-full p-3 rounded-md border border-gray-700 bg-gray-800/50 text-gray-200 font-medium flex items-center justify-center space-x-2 hover:bg-gray-700 transition"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24"
				><path
					d="M19.4 12.9L12.7 19.6C12.5 19.8 12.3 19.9 12 19.9C11.7 19.9 11.5 19.8 11.3 19.6L4.6 12.9C4.4 12.7 4.3 12.4 4.3 12.2C4.3 11.9 4.4 11.7 4.6 11.5L11.3 4.8C11.5 4.6 11.7 4.5 12 4.5C12.3 4.5 12.5 4.6 12.7 4.8L19.4 11.5C19.6 11.7 19.7 11.9 19.7 12.2C19.7 12.4 19.6 12.7 19.4 12.9Z"
					fill="currentColor"
				/></svg
			>
			<span>Sign in with Metamask</span>
		</button>
	</div>
</div>
