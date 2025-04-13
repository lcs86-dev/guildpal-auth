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

<div class="w-full max-w-md mx-auto">
	<!-- Logo and Text -->
	<div class="flex flex-col items-center mb-10">
		<!-- GuildPal logo image -->
		<img src="/images/guildpal.png" alt="GuildPal logo" class="h-16 mb-5" />
		
		<!-- GuildPal text logo -->
		<h1 class="text-3xl font-bold text-white mb-3">GuildPal</h1>
		
		<!-- Sign in text -->
		<p class="text-center text-[#A1A1AA] text-base">Please enter your details to sign in your account.</p>
	</div>

	<!-- Form -->
	<form class="space-y-5" on:submit|preventDefault={handleSignIn}>
		<!-- Email input with verify button -->
		<div class="relative">
			<input
				id="email"
				type="email"
				bind:value={email}
				placeholder="Please enter your email."
				class="w-full p-3.5 pl-4 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:ring-2 focus:ring-[#4CAF50] pr-32 text-base"
				required
			/>
			<button
				type="button"
				on:click={handleVerifyEmail}
				class="absolute right-2.5 top-2 bottom-2 px-4 rounded-lg bg-[#262626] text-white text-sm hover:bg-[#333333] transition"
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
			class="w-full p-3.5 pl-4 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-base"
			required
		/>

		<!-- Sign in button -->
		<button
			type="submit"
			class="w-full py-3.5 rounded-xl bg-[#4CAF50] text-white font-medium hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2 focus:ring-offset-black mt-2 text-base"
		>
			Sign in
		</button>
	</form>

	<!-- Divider -->
	<div class="flex items-center my-7">
		<div class="flex-1 h-px bg-[#333333]"></div>
		<div class="px-4 text-sm text-[#A1A1AA]">or</div>
		<div class="flex-1 h-px bg-[#333333]"></div>
	</div>

	<!-- Social login buttons -->
	<div class="space-y-3.5">
		<!-- Google login -->
		<button
			class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base"
		>
			<img src="/images/google.png" alt="Google" class="w-5 h-5" />
			<span class="flex-grow text-center">Sign in with Google</span>
		</button>

		<!-- Facebook login -->
		<button
			class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base"
		>
			<img src="/images/facebook.png" alt="Facebook" class="w-5 h-5" />
			<span class="flex-grow text-center">Sign in with Facebook</span>
		</button>

		<!-- Ronin Wallet login -->
		<button
			class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base"
		>
			<img src="/images/ronin.png" alt="Ronin Wallet" class="w-5 h-5" />
			<span class="flex-grow text-center">Sign in with Ronin Wallet</span>
		</button>

		<!-- Metamask login -->
		<button
			class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base"
		>
			<img src="/images/metamask.png" alt="Metamask" class="w-5 h-5" />
			<span class="flex-grow text-center">Sign in with Metamask</span>
		</button>
	</div>
</div>
