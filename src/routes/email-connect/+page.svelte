<!-- src/routes/email-connect/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { emailOtp, client, pga, signIn } from '$lib/auth-client';
	import { EmailVerificationForm } from '../../components';
	import ErrorNotification from '../../components/ErrorNotification.svelte';
	import SignInOverlay from '../../components/SignInOverlay.svelte';

	// Email verification states
	let email = '';
	let code = '';
	let emailError = '';
	let codeError = '';
	let isEmailVerified = false;
	let isVerifying = false;
	let isConnecting = false;
	let showSuccessMessage = false;
	let verificationFailed = false;

	// Error notification states
	let showError = false;
	let errorTitle = '';
	let errorMessage = '';

	// Show overlay
	let showOverlay = false;

	// Email verification handler
	async function handleVerifyEmail(event: CustomEvent): Promise<void> {
		// Get email from event
		email = event.detail.email;

		// Reset states
		emailError = '';
		verificationFailed = false;
		isEmailVerified = false;

		// Start verification process
		isVerifying = true;

		try {
			// Call API to send verification code
			const { data, error } = await emailOtp.sendVerificationOtp({
				email,
				type: 'sign-in'
			});

			if (error) {
				verificationFailed = true;
				emailError = error?.message || 'Failed to send verification code';
				return;
			}

			// Success case
			isEmailVerified = true;
			showSuccessMessage = true;

			console.log('sendVerificationOtp result', { data, error });

			// Hide success message after 3 seconds
			setTimeout(() => {
				showSuccessMessage = false;
			}, 3000);
		} catch (error) {
			console.error('Verification error:', error);
			verificationFailed = true;
			emailError = 'Failed to send verification code. Please try again.';
		} finally {
			isVerifying = false;
		}
	}

	// Handle connection
	async function handleConnect(event: CustomEvent): Promise<void> {
		// Get values from event
		email = event.detail.email;
		code = event.detail.code;

		// Reset errors
		codeError = '';

		// Validate code
		if (!code) {
			codeError = 'Please enter verification code.';
			return;
		}

		if (code.length < 6) {
			codeError = 'Verification code must be at least 6 characters.';
			return;
		}

		// Start connecting state
		isConnecting = true;
		showOverlay = true;

		try {
			// 이메일 OTP 링크 API 호출
			// 이 API는 이메일이 이미 다른 계정에 연결되어 있는 경우 에러를 반환합니다
			const { data, error } = await signIn.emailOtpLink({
				email,
				otp: code
			});

			if (error) {
				console.error('API error:', error.message);

				// 이미 연결된 이메일 에러 처리
				if (error.message?.includes('email already linked')) {
					codeError =
						'This email is already being used by another user. Please use a different email address.';
				} else if (error.message?.includes('invalid otp')) {
					codeError = 'The verification code you entered is incorrect.';
				} else {
					codeError = 'We encountered a problem connecting your email. Please try again later.';
				}
				return;
			}

			// 세션 가져오기
			const session = await client.getSession();
			if (session.error) {
				codeError = 'Failed to retrieve your session. Please try again.';
				return;
			}

			if (window.pga) {
				window.pga.helpers.setAuthToken(session.data);
				pga.addMid({ encryptedMid: 'fake-mid-1' });
			}

			// Success - redirect to account page
			console.log('Successfully connected with:', { email, code });
			goto('/account');
		} catch (error) {
			console.error('Connection error:', error);
			codeError = 'An error occurred while connecting your email. Please try again later.';
			showErrorNotification(
				'Connection Error',
				'An unexpected error occurred while connecting your email. Please try again later.'
			);
		} finally {
			isConnecting = false;
			showOverlay = false;
		}
	}

	// Show error notification
	function showErrorNotification(title: string, message: string): void {
		errorTitle = title;
		errorMessage = message;
		showError = true;
	}

	// Close error notification
	function closeErrorNotification(): void {
		showError = false;
	}

	function goBack(): void {
		// Navigate back to account page
		goto('/account');
	}
</script>

<div class="w-full max-w-md mx-auto">
	<!-- Back button - 박스 바깥쪽 상단에 배치 -->
	<button
		class="mb-4 text-[#A1A1AA] hover:text-white transition flex items-center"
		on:click={goBack}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5 mr-1"
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
		<span class="text-sm">Back</span>
	</button>

	<div class="bg-[#1A1A1A] rounded-xl shadow p-6">
		<!-- Title -->
		<h2 class="text-center text-white text-xl font-medium mb-8">E-mail connect</h2>

		<!-- Email Verification Form -->
		<EmailVerificationForm
			bind:email
			bind:code
			bind:emailError
			bind:codeError
			bind:isEmailVerified
			bind:isVerifying
			bind:showSuccessMessage
			bind:verificationFailed
			isSigningIn={isConnecting}
			on:verify-email={handleVerifyEmail}
			on:sign-in={handleConnect}
		/>
	</div>

	<!-- Connection overlay (large spinner) -->
	{#if showOverlay}
		<SignInOverlay />
	{/if}

	<!-- Error notification display -->
	<ErrorNotification
		show={showError}
		title={errorTitle}
		message={errorMessage}
		onClose={closeErrorNotification}
		autoDismiss={true}
		dismissDuration={5000}
	/>
</div>
