<script lang="ts">
	import { goto } from '$app/navigation';
	import { client, pga, signIn } from '$lib/auth-client';
	import { onMount } from 'svelte';
	import { walletSignIn } from '$lib/walletUtils';
	import { 
		WalletSignInOverlay, 
		ErrorNotification, 
		EmailVerificationForm, 
		WalletSignIn 
	} from '../components';

	// 이메일 관련 상태
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

	// 지갑 관련 상태
	let isWalletLoading = false;
	let loadingWalletType = '';
	let walletError = '';
	let showWalletError = false;

	// 데모용 올바른 인증 코드
	const correctCode = '123456';

	// 이메일 인증 처리
	function handleVerifyEmail(): void {
		console.log('handleVerifyEmail called with email:', email);
		
		// 리셋 상태
		emailError = '';
		verificationFailed = false;
		isEmailVerified = false;

		// API 호출 시뮬레이션
		isVerifying = true;

		// 지연 시뮬레이션
		setTimeout(() => {
			console.log('Verifying email:', email);
			isVerifying = false;

			// 성공 또는 실패 시뮬레이션 (90% 성공률)
			const isSuccess = Math.random() < 0.9;
			console.log('Verification result:', isSuccess ? 'success' : 'failed');

			if (isSuccess) {
				// 성공 케이스
				isEmailVerified = true;
				showSuccessMessage = true;

				// 3초 후 성공 메시지 숨김
				setTimeout(() => {
					showSuccessMessage = false;
				}, 3000);
			} else {
				// 실패 케이스
				verificationFailed = true;
				emailError = 'Failed to send verification code. Please try again.';
			}
		}, 1500);
	}

	// 이메일 로그인 처리
	function handleSignIn(): void {
		// 오류 리셋
		codeError = '';

		// 이메일 인증 검증
		if (!isEmailVerified) {
			emailError = 'Please verify your email first.';
			return;
		}

		// 코드 검증
		if (!code) {
			codeError = 'Please enter verification code.';
			return;
		}

		if (code.length < 6) {
			codeError = 'Verification code must be at least 6 characters.';
			return;
		}

		// 로그인 프로세스 시작
		isSigningIn = true;

		// API 호출 지연 시뮬레이션
		setTimeout(() => {
			// 코드 검증 (데모용)
			if (code !== correctCode) {
				isSigningIn = false;
				codeError = 'Invalid verification code. Please try again.';
				return;
			}

			// 성공 - 리다이렉트
			console.log('Successfully signed in with:', { email, code, rememberMe, autoLogin });

			// 계정 페이지로 이동
			window.location.href = '/account';
		}, 1000);
	}

	// 오류 닫기 핸들러
	function handleCloseError(): void {
		showWalletError = false;
	}

	// 지갑 로그인 핸들러
	async function onWalletSignIn(event: CustomEvent): Promise<void> {
		const { walletType } = event.detail;
		
		// 지갑 로그인 시작
		isWalletLoading = true;
		loadingWalletType = walletType === 'ronin' ? 'Ronin Wallet' : 'MetaMask';
		
		// 지갑 로그인 처리
		const result = await walletSignIn(walletType, signIn, client, pga);
		
		// 결과 처리
		if (result.success) {
			if (window.pga) {
				window.pga.helpers.setAuthToken(result.sessionData);
				pga.addMid({ encryptedMid: 'fake-mid-1' });
			}
			
			// 성공 페이지로 이동
			goto(`/sign-in-success?login_method=${walletType}`, { replaceState: true });
		} else {
			walletError = result.error || 'Unknown error occurred';
			showWalletError = true;
		}
		
		isWalletLoading = false;
	}

	// 이메일 폼 이벤트 핸들러
	function onVerifyEmail(event: CustomEvent): void {
		console.log('Verify email event received:', event.detail);
		// 이메일 값을 이벤트에서 가져옴
		email = event.detail.email;
		// 검증 로직 실행
		handleVerifyEmail();
	}
	
	function onSignIn(event: CustomEvent): void {
		console.log('Sign in event received:', event.detail);
		// 값들을 이벤트에서 가져옴
		email = event.detail.email;
		code = event.detail.code;
		// 로그인 로직 실행
		handleSignIn();
	}
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

	<!-- Email Verification Form -->
	<EmailVerificationForm 
		bind:email
		bind:code
		bind:emailError
		bind:codeError
		bind:isEmailVerified
		bind:isVerifying
		bind:isSigningIn
		bind:showSuccessMessage
		bind:verificationFailed
		disabled={isWalletLoading}
		on:verify-email={onVerifyEmail}
		on:sign-in={onSignIn}
	/>

	<!-- Divider -->
	<div class="flex items-center my-7">
		<div class="flex-1 h-px bg-[#333333]"></div>
		<div class="px-4 text-sm text-[#A1A1AA]">or</div>
		<div class="flex-1 h-px bg-[#333333]"></div>
	</div>

	<!-- Wallet Sign In Buttons -->
	<WalletSignIn 
		isLoading={isWalletLoading} 
		loadingWalletType={loadingWalletType}
		on:wallet-signin={onWalletSignIn}
	/>
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
