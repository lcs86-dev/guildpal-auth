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
	<div class="w-full mb-8">
		<div class="flex items-center">
			<div class="flex items-center">
				<!-- GuildPal 로고 이미지로 교체 -->
				<img src="/images/guildpal_green.png" alt="GuildPal" class="h-7 mr-2" />
				<span class="text-xl font-bold text-[#4CAF50]">GuildPal</span>
			</div>

			<!-- Manage Account Text -->
			<span class="text-white ml-6 text-xl font-medium">Manage Account</span>
		</div>
	</div>

	<div class="w-full flex flex-col gap-6">
		<!-- Profile Settings Section -->
		<div class="bg-[#1A1A1A] rounded-xl shadow p-6">
			<h2 class="text-lg font-medium text-white mb-6">Profile Settings</h2>

			<div class="rounded-lg bg-[#262626] p-4">
				<div class="flex justify-between items-center">
					<div>
						<p class="text-sm text-[#A1A1AA]">Your E-mail</p>
						<p class="text-white">-</p>
					</div>
					<button
						on:click={() => handleConnect('email')}
						class="text-[#4CAF50] text-sm hover:opacity-80 transition flex items-center"
					>
						Connect <span class="ml-1">+</span>
					</button>
				</div>
			</div>
		</div>

		<!-- SNS & Wallet Connections Section -->
		<div class="bg-[#1A1A1A] rounded-xl shadow p-6">
			<h2 class="text-lg font-medium text-white mb-6">SNS & Wallet Connections</h2>

			<!-- Google Connection -->
			<div class="rounded-lg bg-[#262626] p-4 mb-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center">
						<img src="/images/google.png" alt="Google" class="h-5 w-5 mr-3" />
						<div>
							<p class="text-white">Google</p>
							<p class="text-[#4CAF50] text-sm">{email}</p>
						</div>
					</div>
					<div class="text-[#A1A1AA] text-sm">Connected</div>
				</div>
			</div>

			<!-- Facebook Connection -->
			<div class="rounded-lg bg-[#262626] p-4 mb-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center">
						<img src="/images/facebook.png" alt="Facebook" class="h-5 w-5 mr-3" />
						<div>
							<p class="text-white">Facebook</p>
							<p class="text-[#A1A1AA] text-sm">-</p>
						</div>
					</div>
					<button
						on:click={() => handleConnect('facebook')}
						class="text-[#4CAF50] text-sm hover:opacity-80 transition flex items-center"
					>
						Connect <span class="ml-1">+</span>
					</button>
				</div>
			</div>

			<!-- Ronin Wallet Connection -->
			<div class="rounded-lg bg-[#262626] p-4 mb-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center">
						<img src="/images/ronin.png" alt="Ronin Wallet" class="h-5 w-5 mr-3" />
						<div>
							<p class="text-white">Ronin Wallet</p>
							<p class="text-[#A1A1AA] text-sm">-</p>
						</div>
					</div>
					<button
						on:click={() => handleConnect('ronin')}
						class="text-[#4CAF50] text-sm hover:opacity-80 transition flex items-center"
					>
						Connect <span class="ml-1">+</span>
					</button>
				</div>
			</div>

			<!-- Metamask Wallet Connection -->
			<div class="rounded-lg bg-[#262626] p-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center">
						<img src="/images/metamask.png" alt="Metamask" class="h-5 w-5 mr-3" />
						<div>
							<p class="text-white">Metamask Wallet</p>
							<p class="text-[#A1A1AA] text-sm">-</p>
						</div>
					</div>
					<button
						on:click={() => handleConnect('metamask')}
						class="text-[#4CAF50] text-sm hover:opacity-80 transition flex items-center"
					>
						Connect <span class="ml-1">+</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
