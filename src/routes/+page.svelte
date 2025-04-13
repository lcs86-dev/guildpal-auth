<script lang="ts">
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

	// 지갑 유형 인터페이스
	interface WalletConfig {
		name: string;
		providerKey: 'ronin' | 'ethereum';
		isWalletAvailable: (window: Window) => boolean;
		getProvider: (window: Window) => any;
		statement: string;
		walletName: string;
	}

	// 지갑 설정
	const walletConfigs: Record<string, WalletConfig> = {
		ronin: {
			name: 'Ronin Wallet',
			providerKey: 'ronin',
			isWalletAvailable: (window) => !!window?.ronin?.provider,
			getProvider: (window) => window.ronin.provider,
			statement: 'Sign in with Ronin to the app.',
			walletName: 'ronin'
		},
		metamask: {
			name: 'MetaMask',
			providerKey: 'ethereum',
			isWalletAvailable: (window) => !!window?.ethereum && !!window?.ethereum?.isMetaMask,
			getProvider: (window) => window.ethereum,
			statement: 'Sign in with Ethereum to the app.',
			walletName: 'metamask'
		}
	};

	function validateEmail(email: string): boolean {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	function handleVerifyEmail(): void {
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

	function handleSignIn(): void {
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
	function handleCloseError(): void {
		showWalletError = false;
	}

	// 공통 지갑 로그인 함수
	const handleWalletSignIn = async (walletType: 'ronin' | 'metamask'): Promise<void> => {
		// 지갑 설정 가져오기
		const walletConfig = walletConfigs[walletType];
		
		// 오류 초기화
		walletError = '';
		showWalletError = false;
		
		// 로딩 상태 설정
		isWalletLoading = true;
		loadingWalletType = walletConfig.name;
		
		try {
			// 지갑 사용 가능 여부 확인
			if (!walletConfig.isWalletAvailable(window)) {
				walletError = `${walletConfig.name} not found. Please install the extension.`;
				showWalletError = true;
				return;
			}

			const provider = new BrowserProvider(walletConfig.getProvider(window));
			
			try {
				// 계정 요청
				const addresses = await provider.send('eth_requestAccounts', []);
				const address = ethers.getAddress(addresses[0]);
				
				// 서명자 가져오기
				const signer = await provider.getSigner();
				
				// 논스 가져오기
				const nonceResponse = await signIn.nonce({ address });
				if (nonceResponse.error) {
					walletError = 'Failed to get authentication nonce. Please try again.';
					showWalletError = true;
					return;
				}
				
				// 메시지 파라미터 준비
				const messageParams = {
					scheme: window.location.protocol.slice(0, -1),
					domain: window.location.host,
					address,
					statement: walletConfig.statement,
					uri: window.location.origin,
					version: '1',
					nonce: nonceResponse.data?.nonce,
					chainId: 1
				};
				
				// 메시지 생성 및 서명
				const message = new SiweMessage(messageParams);
				const messageToSign = message.prepareMessage();
				const signature = await signer.signMessage(messageToSign);
				
				if (walletType === 'metamask') {
					console.log('signature and messageToSign', { signature, messageToSign });
				}
				
				// 서명 검증
				const result = await signIn.verify({
					message: messageToSign,
					signature,
					address,
					walletName: walletConfig.walletName
				});
				
				if (walletType === 'metamask') {
					console.log('result', result);
				}
				
				// 세션 가져오기 및 리다이렉트
				const session = await client.getSession();
				
				if (walletType === 'metamask') {
					console.log('sign-in session', session);
				}
				
				if (session.error) {
					walletError = 'Session creation failed. Please try again.';
					showWalletError = true;
					return;
				}
				
				if (window.pga) {
					window.pga.helpers.setAuthToken(session.data);
					pga.addMid({ encryptedMid: 'fake-mid-1' });
				}
				
				// 성공 페이지로 이동
				goto(`/sign-in-success?login_method=${walletType}`, { replaceState: true });
			} catch (error: any) {
				console.error(`${walletConfig.name} request error:`, error);
				
				if (error.code === 4001) {
					walletError = 'You declined the signature request. Please try again and approve the request.';
				} else {
					walletError = `Failed to connect with ${walletConfig.name}. Please try again.`;
				}
				showWalletError = true;
			}
		} catch (error: any) {
			console.error(`${walletConfig.name} sign-in error:`, error);
			walletError = 'An unexpected error occurred. Please try again.';
			showWalletError = true;
		} finally {
			isWalletLoading = false;
		}
	};

	// 기존 함수를 리팩토링된 버전으로 대체
	const handleRoninSignIn = (): Promise<void> => handleWalletSignIn('ronin');
	const handleMetamaskSignIn = (): Promise<void> => handleWalletSignIn('metamask');
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
