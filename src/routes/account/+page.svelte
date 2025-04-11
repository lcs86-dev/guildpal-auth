<!-- src/routes/account/+page.svelte -->
<script>
	import { onMount } from 'svelte';

	let email = 'PGA123@gmail.com';

	function handleConnect(service) {
		if (service === 'email') {
			window.location.href = '/email-connect';
		} else {
			console.log(`Connecting to ${service}`);
		}
	}
</script>

<!-- <div class="w-full min-h-screen flex flex-col items-start bg-slate-900 p-4"> -->
<div class="w-full max-w-md">
	<!-- Header with logo -->
	<div class="w-full max-w-2xl mx-auto mb-6 mt-2">
		<div class="flex items-center">
			<div class="flex items-center text-green-500">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 mr-2"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M12 2L4 8v8s0 4 8 4 8-4 8-4V8l-8-6z" />
					<path d="M12 6v12" />
					<path d="M12 6c-2.2 0-4 1.8-4 4" />
				</svg>
				<span class="text-xl font-bold">GuildPal</span>
			</div>

			<!-- Manage Account Text -->
			<span class="text-gray-300 ml-6 text-xl">Manage Account</span>
		</div>
	</div>

	<div class="w-full max-w-md mx-auto flex flex-col gap-6">
		<!-- Profile Settings Section -->
		<div class="bg-gray-800/90 rounded-xl shadow-md p-6">
			<h2 class="text-lg font-medium text-white mb-6">Profile Settings</h2>

			<div class="rounded-lg bg-gray-700/70 p-4">
				<div class="flex justify-between items-center">
					<div>
						<p class="text-sm text-gray-400">Your E-mail</p>
						<p class="text-gray-300">-</p>
					</div>
					<button
						on:click={() => handleConnect('email')}
						class="text-green-500 text-sm hover:text-green-400 transition flex items-center"
					>
						Connect <span class="ml-1">+</span>
					</button>
				</div>
			</div>
		</div>

		<!-- SNS & Wallet Connections Section -->
		<div class="bg-gray-800/90 rounded-xl shadow-md p-6">
			<h2 class="text-lg font-medium text-white mb-6">SNS & Wallet Connections</h2>

			<!-- Google Connection -->
			<div class="rounded-lg bg-gray-700/70 p-4 mb-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 24 24">
							<path
								d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
								fill="#4285F4"
							/>
						</svg>
						<div>
							<p class="text-white">Google</p>
							<p class="text-green-500 text-sm">{email}</p>
						</div>
					</div>
					<div class="text-gray-400 text-sm">Connection</div>
				</div>
			</div>

			<!-- Facebook Connection -->
			<div class="rounded-lg bg-gray-700/70 p-4 mb-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center">
						<svg class="h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9 21.59 18.03 20.37 19.6 18.55C21.17 16.72 22.04 14.4 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
							/>
						</svg>
						<div>
							<p class="text-white">Facebook</p>
							<p class="text-gray-400 text-sm">-</p>
						</div>
					</div>
					<button
						on:click={() => handleConnect('facebook')}
						class="text-green-500 text-sm hover:text-green-400 transition flex items-center"
					>
						Connect <span class="ml-1">+</span>
					</button>
				</div>
			</div>

			<!-- Ronin Wallet Connection -->
			<div class="rounded-lg bg-gray-700/70 p-4 mb-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center">
						<svg
							class="h-5 w-5 mr-3 text-blue-400"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								d="M12 12L8.5 8.5M12 12L15.5 8.5M12 12V17.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<div>
							<p class="text-white">Ronin Wallet</p>
							<p class="text-gray-400 text-sm">-</p>
						</div>
					</div>
					<button
						on:click={() => handleConnect('ronin')}
						class="text-green-500 text-sm hover:text-green-400 transition flex items-center"
					>
						Connect <span class="ml-1">+</span>
					</button>
				</div>
			</div>

			<!-- Metamask Wallet Connection -->
			<div class="rounded-lg bg-gray-700/70 p-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center">
						<svg class="h-5 w-5 mr-3 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M19.4 12.9L12.7 19.6C12.5 19.8 12.3 19.9 12 19.9C11.7 19.9 11.5 19.8 11.3 19.6L4.6 12.9C4.4 12.7 4.3 12.4 4.3 12.2C4.3 11.9 4.4 11.7 4.6 11.5L11.3 4.8C11.5 4.6 11.7 4.5 12 4.5C12.3 4.5 12.5 4.6 12.7 4.8L19.4 11.5C19.6 11.7 19.7 11.9 19.7 12.2C19.7 12.4 19.6 12.7 19.4 12.9Z"
							/>
						</svg>
						<div>
							<p class="text-white">Metamask Wallet</p>
							<p class="text-gray-400 text-sm">-</p>
						</div>
					</div>
					<button
						on:click={() => handleConnect('metamask')}
						class="text-green-500 text-sm hover:text-green-400 transition flex items-center"
					>
						Connect <span class="ml-1">+</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
