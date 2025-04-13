<script>
	import { goto } from '$app/navigation';
	import { client, pga, signIn } from '$lib/auth-client';
	import { BrowserProvider, ethers } from 'ethers';
	import { SiweMessage } from 'siwe';
	import { onMount } from 'svelte';
	import { WalletSignInOverlay, ErrorNotification } from '../components';

	let email = '';
	let code = '';
	let rememberMe = false;
	let autoLogin = false;
	let emailError = '';
	let codeError = '';
	let isEmailVerified = false;
	let isVerifying = false;
	let isSigningIn = false;
	let showSuccessMessage = false;
	let verificationFailed = false;
	let isWalletLoading = false;
	let loadingWalletType = '';
	let walletError = '';
	let showWalletError = false;

	// 데모용 올바른 인증 코드
	const correctCode = '123456';

	function validateEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	function handleVerifyEmail() {
		// Reset states
		emailError = '';
		verificationFailed = false;
		isEmailVerified = false;

		// Validate email
		if (!email) {
			emailError = 'Please enter your email.';
			return;
		}

		if (!validateEmail(email)) {
			emailError = 'Please enter a valid email address.';
			return;
		}

		// Simulate email verification
		isVerifying = true;

		// Simulate API call delay
		setTimeout(() => {
			console.log('Verifying email:', email);
			isVerifying = false;

			// Simulate success or failure (90% success rate for demo)
			const isSuccess = Math.random() < 0.9;

			if (isSuccess) {
				// Success case
				isEmailVerified = true;
				showSuccessMessage = true;

				// Hide success message after 3 seconds
				setTimeout(() => {
					showSuccessMessage = false;
				}, 3000);
			} else {
				// Failure case
				verificationFailed = true;
				emailError = 'Failed to send verification code. Please try again.';
			}
		}, 1500);
	}

	function handleSignIn() {
		// Reset errors
		codeError = '';

		// Validate verification first
		if (!isEmailVerified) {
			emailError = 'Please verify your email first.';
			return;
		}

		// Validate code
		if (!code) {
			codeError = 'Please enter verification code.';
			return;
		}

		if (code.length < 6) {
			codeError = 'Verification code must be at least 6 characters.';
			return;
		}

		// Start signing in process
		isSigningIn = true;

		// Simulate API call delay
		setTimeout(() => {
			// Check if code is correct (demo purpose)
			if (code !== correctCode) {
				isSigningIn = false;
				codeError = 'Invalid verification code. Please try again.';
				return;
			}

			// Success - redirect or handle successful sign-in
			console.log('Successfully signed in with:', { email, code, rememberMe, autoLogin });

			// Navigate to account page or wherever needed
			window.location.href = '/account';
		}, 1000);
	}

	// 오류 닫기 핸들러
	function handleCloseError() {
		showWalletError = false;
	}

	const handleRoninSignIn = async () => {
		// Reset previous errors
		walletError = '';
		showWalletError = false;
		
		isWalletLoading = true;
		loadingWalletType = 'Ronin Wallet';
		
		try {
			// Check if wallet is available
			if (!window?.ronin?.provider) {
				walletError = 'Ronin Wallet not found. Please install the extension.';
				showWalletError = true;
				return;
			}

			const provider = new BrowserProvider(window.ronin.provider);
			
			try {
				// Request accounts
				const addresses = await provider.send('eth_requestAccounts', []);
				const address = ethers.getAddress(addresses[0]);
				
				// Get signer
				const signer = await provider.getSigner();
				
				// Get nonce
				const nonceResponse = await signIn.nonce({ address });
				if (nonceResponse.error) {
					walletError = 'Failed to get authentication nonce. Please try again.';
					showWalletError = true;
					return;
				}
				
				// Prepare message parameters
				const messageParams = {
					scheme: window.location.protocol.slice(0, -1),
					domain: window.location.host,
					address,
					statement: "Sign in with Ronin to the app.",
					uri: window.location.origin,
					version: '1',
					nonce: nonceResponse.data?.nonce,
					chainId: 1
				};
				
				// Create and sign message
				const message = new SiweMessage(messageParams);
				const messageToSign = message.prepareMessage();
				const signature = await signer.signMessage(messageToSign);
				
				// Verify signature
				await signIn.verify({
					message: messageToSign,
					signature,
					address,
					walletName: 'ronin'
				});
				
				// Get session and redirect
				const session = await client.getSession();
				if (!session.error && window.pga) {
					window.pga.helpers.setAuthToken(session.data);
					pga.addMid({ encryptedMid: 'fake-mid-1' });
				}
				
				// Redirect to success page
				goto('/sign-in-success?login_method=ronin', { replaceState: true });
			} catch (reqError) {
				console.error('Request error:', reqError);
				
				if (reqError.code === 4001) {
					walletError = 'You declined the signature request. Please try again and approve the request.';
				} else {
					walletError = 'Failed to connect with Ronin Wallet. Please try again.';
				}
				showWalletError = true;
			}
		} catch (error) {
			console.error('Ronin sign-in error:', error);
			walletError = 'An unexpected error occurred. Please try again.';
			showWalletError = true;
		} finally {
			isWalletLoading = false;
		}
	};
	
	const handleMetamaskSignIn = async () => {
		isWalletLoading = true;
		loadingWalletType = 'MetaMask';
		
		try {
			if (!window?.ethereum) {
				alert('MetaMask not found');
				isWalletLoading = false;
				return;
			}
			
			// MetaMask sign-in implementation
			// (Similar to Ronin implementation)
			
			// For demo purposes, just simulate a delay
			setTimeout(() => {
				isWalletLoading = false;
				// Implement actual MetaMask login logic here
			}, 2000);
			
		} catch (error) {
			console.error(error);
			isWalletLoading = false;
		}
	};
</script>

<div class="w-full max-w-md mx-auto relative">
	{#if isWalletLoading}
		<WalletSignInOverlay walletName={loadingWalletType} />
	{/if}

	<ErrorNotification 
		show={showWalletError} 
		title="Connection Error" 
		message={walletError} 
		onClose={handleCloseError}
		autoDismiss={true}
		dismissDuration={5000}
	/>

	<!-- Logo and Text -->
	<div class="flex flex-col items-center mb-10">
		<!-- GuildPal logo image -->
		<img src="/images/guildpal.png" alt="GuildPal logo" class="h-16 mb-5" />

		<!-- GuildPal text logo -->
		<h1 class="text-3xl font-bold text-white mb-3">GuildPal</h1>

		<!-- Sign in text -->
		<p class="text-center text-[#A1A1AA] text-base">
			Please enter your details to sign in your account.
		</p>
	</div>

	<!-- Form -->
	<form class="space-y-5" on:submit|preventDefault={handleSignIn}>
		<!-- Email input with verify button -->
		<div class="space-y-1">
			<div class="relative">
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="Please enter your email."
					class={`w-full p-3.5 pl-4 rounded-xl bg-[#1A1A1A] border 
						${
							emailError
								? 'border-red-500 focus:ring-red-500'
								: isEmailVerified
									? 'border-[#4CAF50] focus:ring-[#4CAF50]'
									: 'border-[#333333] focus:ring-[#4CAF50]'
						} 
						text-white focus:outline-none focus:ring-2 pr-32 text-base`}
					disabled={isVerifying || isEmailVerified || isWalletLoading}
				/>
				<button
					type="button"
					on:click={handleVerifyEmail}
					disabled={isVerifying || isEmailVerified || isWalletLoading}
					class={`absolute right-2.5 top-2 bottom-2 px-4 rounded-lg transition flex items-center justify-center min-w-[105px]
						${
							isVerifying
								? 'bg-[#1A1A1A] text-[#4CAF50] cursor-not-allowed'
								: isEmailVerified
									? 'bg-[#262626] text-[#4CAF50] cursor-not-allowed'
									: verificationFailed
										? 'bg-[#262626] text-red-400 hover:bg-[#333333]'
										: 'bg-[#262626] text-white hover:bg-[#333333]'
						}`}
				>
					{#if isVerifying}
						<svg
							class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#4CAF50]"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Sending...
					{:else if isEmailVerified}
						<svg class="h-4 w-4 text-[#4CAF50] mr-1" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
						Sent
					{:else if verificationFailed}
						<svg class="h-4 w-4 text-red-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
						Try Again
					{:else}
						Verify Email
					{/if}
				</button>
			</div>

			{#if emailError}
				<p class="text-red-500 text-sm pl-1 flex items-center">
					<svg class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
					{emailError}
				</p>
			{/if}

			{#if showSuccessMessage}
				<p class="text-[#4CAF50] text-sm pl-1 flex items-center">
					<svg class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					Verification code sent to your email.
				</p>
			{/if}
		</div>

		<!-- Verification code input -->
		<div class="space-y-1">
			<input
				id="code"
				type="text"
				bind:value={code}
				placeholder="Enter Verification Code."
				class={`w-full p-3.5 pl-4 rounded-xl bg-[#1A1A1A] border 
					${codeError ? 'border-red-500 focus:ring-red-500' : 'border-[#333333] focus:ring-[#4CAF50]'} 
					text-white focus:outline-none focus:ring-2 text-base`}
				disabled={!isEmailVerified || isSigningIn || isWalletLoading}
			/>

			{#if codeError}
				<p class="text-red-500 text-sm pl-1 flex items-center">
					<svg class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
					{codeError}
				</p>
			{/if}
		</div>

		<!-- Sign in button -->
		<button
			type="submit"
			disabled={!isEmailVerified || isSigningIn || isWalletLoading}
			class={`w-full py-3.5 rounded-xl text-white font-medium transition mt-2 text-base
				${
					!isEmailVerified || isWalletLoading
						? 'bg-[#4CAF50]/50 cursor-not-allowed'
						: isSigningIn
							? 'bg-[#4CAF50]/70 cursor-wait'
							: 'bg-[#4CAF50] hover:opacity-90'
				}`}
		>
			{#if isSigningIn}
				<span class="flex items-center justify-center">
					<svg
						class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Signing in...
				</span>
			{:else}
				Sign in
			{/if}
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
			disabled={isWalletLoading}
		>
			<img src="/images/google.png" alt="Google" class="w-5 h-5" />
			<span class="flex-grow text-center">Sign in with Google</span>
		</button>

		<!-- Ronin Wallet login -->
		<button
			class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base"
			on:click={handleRoninSignIn}
			disabled={isWalletLoading}
		>
			<img src="/images/ronin.png" alt="Ronin Wallet" class="w-5 h-5" />
			<span class="flex-grow text-center">
				{#if isWalletLoading && loadingWalletType === 'Ronin Wallet'}
					Signing in...
				{:else}
					Sign in with Ronin Wallet
				{/if}
			</span>
		</button>

		<!-- Metamask login -->
		<button
			class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base"
			on:click={handleMetamaskSignIn}
			disabled={isWalletLoading}
		>
			<img src="/images/metamask.png" alt="Metamask" class="w-5 h-5" />
			<span class="flex-grow text-center">
				{#if isWalletLoading && loadingWalletType === 'MetaMask'}
					Signing in...
				{:else}
					Sign in with MetaMask
				{/if}
			</span>
		</button>
	</div>
</div>

<style>
	@keyframes slideDown {
		from {
			transform: translateY(-20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.animate-slideDown {
		animation: slideDown 0.3s ease-out forwards;
	}
</style>
