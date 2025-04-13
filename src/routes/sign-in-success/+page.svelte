<!-- src/routes/success/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { client, pga } from '$lib/auth-client';
	import { setupPGAAuth } from '$lib/pgaUtils';

	let email = '';
	let successTitle = 'You have successfully logged in.';
	let successDescription = 'Clicking \'Confirm\' will close the window.';
	let displayInfo = ''; // 표시할 정보 (이메일 또는 지갑 주소)
	let isLoading = true; // 로딩 상태 추가

	// 세션 정보 초기화 함수
	async function initialize() {
		try {
			// 로그인 방식 가져오기
			const loginMethod = $page.url.searchParams.get('login_method') || 'email';
			
			// 세션 정보 가져오기
			const session = await client.getSession();
			if (session.error) {
				console.error('Session error:', session.error);
				return;
			}
		  setupPGAAuth(session.data)
			
			// 사용자 이메일 설정 (세션에서 가져옴)
			if (session.data?.user?.email) {
				email = session.data.user.email;
			} else {
				// URL 파라미터에서 이메일 가져옴 (fallback)
				email = $page.url.searchParams.get('email') || '';
			}
			
			// 지갑 주소 마스킹 함수
			const maskAddress = (address: string): string => {
				if (!address || address.length < 10) return address;
				return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
			};
			
			// 지갑 로그인인 경우 세션에서 주소 가져오기
			let walletAddress = '';
			if (loginMethod === 'ronin' || loginMethod === 'metamask') {
				// 지갑 정보 찾기
				const foundWallet = session.data?.wallet?.find(w => w.name === loginMethod);
				if (foundWallet?.address) {
					walletAddress = foundWallet.address;
				} else {
					// URL 파라미터에서 주소 가져옴 (fallback)
					walletAddress = $page.url.searchParams.get('address') || '';
				}
			}
			
			// 로그인 방식에 따라 성공 메시지 설정
			switch (loginMethod) {
				case 'email':
					successTitle = 'Email Verification Successful';
					successDescription = 'You have successfully verified your email address.';
					displayInfo = email;
					break;
				case 'google':
					successTitle = 'Google Sign-In Successful';
					successDescription = 'You have successfully signed in with your Google account.';
					displayInfo = email;
					break;
				case 'ronin':
					successTitle = 'Ronin Wallet Connected';
					successDescription = 'Your Ronin Wallet has been successfully connected.';
					displayInfo = maskAddress(walletAddress);
					break;
				case 'metamask':
					successTitle = 'MetaMask Wallet Connected';
					successDescription = 'Your MetaMask Wallet has been successfully connected.';
					displayInfo = maskAddress(walletAddress);
					break;
				default:
					// 기본값 사용
					displayInfo = email;
					break;
			}

		} catch (error) {
			console.error('Initialization error:', error);
		} finally {
			// 로딩 상태 해제
			isLoading = false;
		}
	}

	// 페이지가 마운트될 때 정보 설정
	onMount(() => {
		initialize();
	});

	function handleConfirm() {
		goto('/account');
	}
</script>

<div class="flex justify-center items-center w-full max-w-md mx-auto">
	<!-- Modal container with shadow -->
	<div class="w-full relative">
		<!-- 로딩 중이면 빈 컨테이너로 동일한 높이 확보 -->
		{#if isLoading}
			<div class="bg-[#1A1A1A] rounded-3xl shadow-xl overflow-hidden min-h-[400px] flex items-center justify-center">
				<!-- 로딩 표시 -->
				<div class="animate-pulse text-gray-600">Loading...</div>
			</div>
		{:else}
			<!-- 데이터 로드 완료 후 표시 -->
			<div class="bg-[#1A1A1A] rounded-3xl shadow-xl overflow-hidden" in:fade={{ duration: 300 }}>
				<!-- Inner content area - exact color from Figma (#262626) -->
				<div class="bg-[#262626] rounded-md m-4 p-8 flex flex-col items-center">
					<!-- Green checkmark icon - exact color from Figma (#4CAF50) -->
					<div class="w-16 h-16 bg-[#4CAF50] rounded-full flex items-center justify-center mb-8">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-10 w-10 text-white"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>

					<!-- Success message with custom text based on login method -->
					<h2 class="text-xl text-white mb-1 text-center">{successTitle}</h2>
					<p class="text-gray-400 mb-8 text-center text-sm">{successDescription}</p>

					<!-- Email or wallet address badge -->
					<div class="bg-[#333333] text-[#4CAF50] px-10 py-2 rounded-full text-center w-full max-w-xs">
						{displayInfo}
					</div>
				</div>

				<!-- Confirm button in its own section - exact color from Figma (#4CAF50) -->
				<div class="m-4">
					<button
						on:click={handleConfirm}
						class="w-full py-3 bg-[#4CAF50] rounded-md text-white text-lg font-normal hover:opacity-90 transition"
					>
						Confirm
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
