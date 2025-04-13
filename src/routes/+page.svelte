<script lang="ts">
	import { goto } from '$app/navigation';
	import { client, pga, signIn, emailOtp } from '$lib/auth-client';
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
	let loginError = '';

	// 지갑 관련 상태
	let isWalletLoading = false;
	let loadingWalletType = '';
	let walletError = '';
	let showWalletError = false;
	let isSocialLoading = false;

	// 데모용 올바른 인증 코드
	const correctCode = '123456';

	// 이메일 인증 처리
	async function handleVerifyEmail(): Promise<void> {
		console.log('handleVerifyEmail called with email:', email);
		
		// 리셋 상태
		emailError = '';
		verificationFailed = false;
		isEmailVerified = false;

		// API 호출
		isVerifying = true;
		
		try {
			const { data, error } = await emailOtp.sendVerificationOtp({
				email,
				type: "sign-in"
			});
			
			if (error) {
				verificationFailed = true;
				emailError = error?.message || 'Failed to send verification code';
				return;
			}
			
			// 성공 케이스
			isEmailVerified = true;
			showSuccessMessage = true;
			
			console.log("sendVerificationOtp result", { data, error });
			
			// 3초 후 성공 메시지 숨김
			setTimeout(() => {
				showSuccessMessage = false;
			}, 3000);
		} catch (error) {
			console.error(error);
			verificationFailed = true;
			emailError = 'Failed to send verification code. Please try again.';
		} finally {
			isVerifying = false;
		}
	}

	// 이메일 로그인 처리
	async function handleSignIn(): Promise<void> {
		// 오류 리셋
		codeError = '';
		loginError = '';

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

		try {
			// 실제 API 호출로 로그인
			const { data, error } = await signIn.emailOtp({
				email,
				otp: code
			});
			
			if (error) {
				codeError = `Sign in failed: ${error.message}`;
				return;
			}
			
			// 세션 가져오기
			const session = await client.getSession();
			if (session.error) {
				codeError = 'Failed to get session. Please try again.';
				return;
			}
			
			if (window.pga) {
				window.pga.helpers.setAuthToken(session.data);
				pga.addMid({ encryptedMid: 'fake-mid-1' });
			}
			
			// 성공 페이지로 이동 (이메일 전달)
			const url = new URL('/sign-in-success', window.location.origin);
			url.searchParams.set('login_method', 'email');
			url.searchParams.set('email', email);
			
			goto(url.toString(), { replaceState: true });
		} catch (error) {
			console.error('Email sign-in error:', error);
			codeError = 'An error occurred during sign in. Please try again.';
		} finally {
			isSigningIn = false;
		}
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
			
			// 성공 페이지로 이동 (지갑 주소도 전달)
			const url = new URL('/sign-in-success', window.location.origin);
			url.searchParams.set('login_method', walletType);
			if (result.address) {
				url.searchParams.set('address', result.address);
			}
			
			goto(url.toString(), { replaceState: true });
		} else {
			walletError = result.error || 'Unknown error occurred';
			showWalletError = true;
		}
		
		isWalletLoading = false;
	}

	// Google 로그인 처리
	async function handleGoogleSignIn(): Promise<void> {
		try {
			isSocialLoading = true;
			
			// Social 로그인은 기본적으로 리디렉션이 발생하므로
			// 여기서 URL 구성 (email 파라미터는 소셜 로그인 후에 추가됨)
			const callbackUrl = new URL('/sign-in-success', window.location.origin);
			callbackUrl.searchParams.set('login_method', 'google');
			
			const signInResult = await signIn.social({
				provider: "google",
				callbackURL: callbackUrl.toString(),
			});
			
			// 소셜 로그인은 리디렉션을 사용하므로 여기에는 도달하지 않음
			// 리디렉션이 발생하지 않는 경우를 위한 처리
			// const session = await client.getSession();
			// if (session.data) {
			// 	if (window.pga) {
			// 		window.pga.helpers.setAuthToken(session.data);
			// 		await pga.addMid({ encryptedMid: "fake-mid-2" });
			// 	}
				
			// 	goto("/sign-in-success?login_method=google", { replaceState: true });
			// }
		} catch (error) {
			console.error('Google sign-in error:', error);
			walletError = 'Failed to sign in with Google. Please try again.';
			showWalletError = true;
			isSocialLoading = false; // 오류 발생 시에만 로딩 상태 해제
		}
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
	{#if isWalletLoading || isSocialLoading}
		<WalletSignInOverlay walletName={isSocialLoading ? 'Google' : loadingWalletType} />
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
		disabled={isWalletLoading || isSocialLoading}
		on:verify-email={onVerifyEmail}
		on:sign-in={onSignIn}
	/>

	<!-- Divider -->
	<div class="flex items-center my-7">
		<div class="flex-1 h-px bg-[#333333]"></div>
		<div class="px-4 text-sm text-[#A1A1AA]">or</div>
		<div class="flex-1 h-px bg-[#333333]"></div>
	</div>
	
	<!-- Google login button -->
	<div class="mb-3.5">
		<button
			class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-[#111111] disabled:hover:bg-[#111111]"
			on:click={handleGoogleSignIn}
			disabled={isWalletLoading || isSocialLoading}
		>
			{#if isSocialLoading}
				<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			{:else}
				<img src="/images/google.png" alt="Google" class="w-5 h-5" />
			{/if}
			<span class="flex-grow text-center">
				Sign in with Google
			</span>
		</button>
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
