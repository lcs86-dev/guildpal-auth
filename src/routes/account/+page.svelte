<!-- src/routes/account/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { client, linkSocial, pga, signIn, signOut } from '$lib/auth-client';
	import { walletLink } from '$lib/walletUtils';
	import SignInOverlay from '../../components/SignInOverlay.svelte';
	import ErrorNotification from '../../components/ErrorNotification.svelte';

	// Connection status variables
	let linked = {
		email: false,
		social: {
			google: false
		},
		wallet: {
			ronin: {
				linked: false,
				address: ''
			},
			metamask: {
				linked: false,
				address: ''
			}
		}
	};

	let session: any = null;
	let isLoading = true;
	let userEmail = '';
	
	// Connection state management
	let isConnectingWallet = false;
	let connectingWalletName = '';
	
	// Error state management
	let showError = false;
	let errorTitle = '';
	let errorMessage = '';

	// Fetch user information
	async function fetchUser() {
		try {
			isLoading = true;
			const s = await client.getSession();
			session = s.data;
			
			if (s?.data?.user?.email) {
				userEmail = s.data.user.email;
			}

			// Check email connection status
			const isEmailLinked = !!s?.data?.user && !!s?.data?.user?.emailVerified;
			
			// Check Google connection status
			const isGoogleLinked = !!(s?.data?.user && 
				Array.isArray(s?.data?.account) && 
				s?.data?.account?.find((a: any) => a.providerId === 'google'));
			
			// Check wallet connection status
			const roninWallet = s?.data?.wallet?.find((w: any) => w.name === 'ronin');
			const metamaskWallet = s?.data?.wallet?.find((w: any) => w.name === 'metamask');

			// Update connection status
			linked = {
				email: isEmailLinked,
				social: {
					google: isGoogleLinked
				},
				wallet: {
					ronin: {
						linked: !!roninWallet,
						address: roninWallet?.address || ''
					},
					metamask: {
						linked: !!metamaskWallet,
						address: metamaskWallet?.address || ''
					}
				}
			};
		} catch (error) {
			console.error('Failed to fetch user data:', error);
			showErrorNotification('Loading Failed', 'Failed to fetch user information.');
		} finally {
			isLoading = false;
		}
	}

	// Navigate to email connection page
	function handleConnect(service: string) {
		if (service === 'email') {
			goto('/email-connect');
		} else if (service === 'google') {
			connectGoogle();
		} else if (service === 'ronin' || service === 'metamask') {
			connectWallet(service as 'ronin' | 'metamask');
		} else {
			console.log(`Connecting to ${service}`);
		}
	}

	// Connect Google account
	async function connectGoogle() {
		try {
			isConnectingWallet = true; // Reusing the same state management for all connection types
			
			await linkSocial({
				provider: 'google',
				callbackURL: '/sign-in-success'
			});
			// Social login will redirect, so we won't return here
		} catch (error) {
			console.error('Failed to connect Google account:', error);
			showErrorNotification('Connection Failed', 'Failed to connect Google account.');
		} finally {
			isConnectingWallet = false;
		}
	}

	// Connect wallet
	async function connectWallet(walletName: 'ronin' | 'metamask') {
		try {
			isConnectingWallet = true;
			connectingWalletName = walletName;
			
			const result = await walletLink(walletName, signIn, client, pga);
			
			if (result.success) {
				console.log(`Connected to ${walletName} wallet with address: ${result.address}`);
				// Refresh user information
				await fetchUser();
			} else {
				showErrorNotification('Connection Failed', result.error || `Failed to connect ${walletName} wallet.`);
			}
		} catch (error: unknown) {
			console.error('Failed to connect wallet:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			showErrorNotification('Connection Failed', `Error connecting to ${walletName} wallet: ${errorMessage}`);
		} finally {
			isConnectingWallet = false;
			connectingWalletName = '';
		}
	}

	// Show error notification
	function showErrorNotification(title: string, message: string) {
		errorTitle = title;
		errorMessage = message;
		showError = true;
	}
	
	// Close error notification
	function closeErrorNotification() {
		showError = false;
	}

	// Sign out
	async function handleSignOut() {
		try {
			await signOut();
			goto('/');
		} catch (error) {
			console.error('Failed to sign out:', error);
			showErrorNotification('Sign Out Failed', 'An error occurred while signing out.');
		}
	}

	// Load user information on page load
	onMount(() => {
		fetchUser();
	});
</script>

<div class="w-full">
	<!-- Header with logo -->
	<div class="w-full mb-8">
		<div class="flex items-center justify-between">
			<div class="flex items-center">
				<!-- GuildPal logo image -->
				<img src="/images/guildpal_green.png" alt="GuildPal" class="h-7 mr-2" />
				<span class="text-xl font-bold text-[#4CAF50]">GuildPal</span>
				
				<!-- Manage Account Text -->
				<span class="text-white ml-6 text-xl font-medium">Manage Account</span>
			</div>
			
			<!-- Sign Out Button -->
			<button
				on:click={handleSignOut}
				class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
			>
				<svg
					class="w-4 h-4 mr-2"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
					></path>
				</svg>
				Sign Out
			</button>
		</div>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center p-8">
			<div class="animate-spin h-8 w-8 border-4 border-t-[#4CAF50] border-gray-600 rounded-full"></div>
		</div>
	{:else}
		<div class="w-full flex flex-col gap-6">
			<!-- Profile Settings Section -->
			<div class="bg-[#1A1A1A] rounded-xl shadow p-6">
				<h2 class="text-lg font-medium text-white mb-6">Profile Settings</h2>

				<div class="rounded-lg bg-[#262626] p-4">
					<div class="flex justify-between items-center">
						<div>
							<p class="text-sm text-[#A1A1AA]">Your E-mail</p>
							{#if linked.email}
								<p class="text-white">{userEmail}</p>
							{:else}
								<p class="text-white">-</p>
							{/if}
						</div>
						{#if !linked.email}
							<button
								on:click={() => handleConnect('email')}
								class="text-[#4CAF50] text-sm hover:opacity-80 transition flex items-center"
							>
								Connect <span class="ml-1">+</span>
							</button>
						{:else}
							<div class="text-[#A1A1AA] text-sm">Connected</div>
						{/if}
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
								{#if linked.social.google}
									<p class="text-[#4CAF50] text-sm">{userEmail}</p>
								{:else}
									<p class="text-[#A1A1AA] text-sm">-</p>
								{/if}
							</div>
						</div>
						{#if !linked.social.google}
							<button
								on:click={() => handleConnect('google')}
								class="text-[#4CAF50] text-sm hover:opacity-80 transition flex items-center"
							>
								Connect <span class="ml-1">+</span>
							</button>
						{:else}
							<div class="text-[#A1A1AA] text-sm">Connected</div>
						{/if}
					</div>
				</div>

				<!-- Ronin Wallet Connection -->
				<div class="rounded-lg bg-[#262626] p-4 mb-4">
					<div class="flex justify-between items-center">
						<div class="flex items-center">
							<img src="/images/ronin.png" alt="Ronin Wallet" class="h-5 w-5 mr-3" />
							<div>
								<p class="text-white">Ronin Wallet</p>
								{#if linked.wallet.ronin.linked}
									<p class="text-[#4CAF50] text-sm">{linked.wallet.ronin.address.slice(0, 8)}...</p>
								{:else}
									<p class="text-[#A1A1AA] text-sm">-</p>
								{/if}
							</div>
						</div>
						{#if !linked.wallet.ronin.linked}
							<button
								on:click={() => handleConnect('ronin')}
								class="text-[#4CAF50] text-sm hover:opacity-80 transition flex items-center"
								disabled={isConnectingWallet}
							>
								{#if isConnectingWallet && connectingWalletName === 'ronin'}
									<span class="inline-block w-4 h-4 border-2 border-[#4CAF50] border-t-transparent rounded-full animate-spin mr-2"></span>
									Connecting...
								{:else}
									Connect <span class="ml-1">+</span>
								{/if}
							</button>
						{:else}
							<div class="text-[#A1A1AA] text-sm">Connected</div>
						{/if}
					</div>
				</div>

				<!-- Metamask Wallet Connection -->
				<div class="rounded-lg bg-[#262626] p-4">
					<div class="flex justify-between items-center">
						<div class="flex items-center">
							<img src="/images/metamask.png" alt="Metamask" class="h-5 w-5 mr-3" />
							<div>
								<p class="text-white">Metamask Wallet</p>
								{#if linked.wallet.metamask.linked}
									<p class="text-[#4CAF50] text-sm">{linked.wallet.metamask.address.slice(0, 8)}...</p>
								{:else}
									<p class="text-[#A1A1AA] text-sm">-</p>
								{/if}
							</div>
						</div>
						{#if !linked.wallet.metamask.linked}
							<button
								on:click={() => handleConnect('metamask')}
								class="text-[#4CAF50] text-sm hover:opacity-80 transition flex items-center"
								disabled={isConnectingWallet}
							>
								{#if isConnectingWallet && connectingWalletName === 'metamask'}
									<span class="inline-block w-4 h-4 border-2 border-[#4CAF50] border-t-transparent rounded-full animate-spin mr-2"></span>
									Connecting...
								{:else}
									Connect <span class="ml-1">+</span>
								{/if}
							</button>
						{:else}
							<div class="text-[#A1A1AA] text-sm">Connected</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Connection overlay (large spinner) -->
	{#if isConnectingWallet}
		<SignInOverlay />
	{/if}
	
	<!-- Error notification display -->
	<ErrorNotification 
		show={showError} 
		title={errorTitle} 
		message={errorMessage} 
		onClose={closeErrorNotification} 
	/>
</div>
