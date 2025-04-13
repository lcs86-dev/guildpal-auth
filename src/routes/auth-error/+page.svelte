<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	// 오류 상태 관리
	let error = '';
	let errorMessage = '';
	let providerName = '';
	let isAccountLinkedError = false;
	let showExplanation = false;
	
	// 홈으로 이동
	function goToHome() {
		goto('/');
	}
	
	// 계정 관리 페이지로 이동
	function goToAccount() {
		goto('/account');
	}
	
	// 로그인 페이지로 이동
	function goToSignIn() {
		goto('/');
	}
	
	// 도움말 토글
	function toggleExplanation() {
		showExplanation = !showExplanation;
	}
	
	// 에러 코드에 따른 메시지 생성
	function getErrorMessageByCode(code: string, provider: string): string {
		switch (code) {
			case 'account_already_linked_to_different_user':
				return `This ${provider} account is already linked to another user. You can only link accounts that aren't associated with any existing users.`;
			case 'invalid_credentials':
				return `Authentication failed with ${provider}. Please check your credentials and try again.`;
			case 'user_cancelled':
				return `${provider} authentication was cancelled. Please try again when you're ready.`;
			case 'network_error':
				return `A network error occurred while connecting to ${provider}. Please check your internet connection and try again.`;
			case 'account_not_verified':
				return `Your ${provider} account is not verified. Please verify your account and try again.`;
			default:
				return `An unexpected error occurred during ${provider} authentication. Please try again or contact support if the issue persists.`;
		}
	}
	
	onMount(() => {
		// 로드된 데이터에서 오류 정보 가져오기
		error = data.error;
		const provider = data.provider;
		
		// 오류 타입 확인
		isAccountLinkedError = error === 'account_already_linked_to_different_user';
		
		// 제공자 이름 설정
		providerName = provider === 'google' 
			? 'Google' 
			: provider === 'facebook' 
				? 'Facebook' 
				: provider === 'ronin' 
					? 'Ronin Wallet' 
					: provider === 'metamask' 
						? 'MetaMask Wallet' 
						: provider;
		
		// 오류 메시지 설정
		errorMessage = getErrorMessageByCode(error, providerName);
		
		// Body 스타일 설정 - 스크롤 방지
		document.body.style.overflow = 'hidden';
		
		// 컴포넌트 언마운트 시 원래 상태로 복원
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:head>
	<title>Authentication Error - GuildPal</title>
	<style>
		html, body {
			height: 100%;
			overflow: hidden;
			margin: 0;
			padding: 0;
		}
	</style>
</svelte:head>

<div class="fixed inset-0 bg-black flex items-center justify-center p-4">
	<div class="bg-[#1A1A1A] rounded-xl max-w-md w-full p-6 shadow-xl border border-[#333333]">
		<div class="flex flex-col items-center text-center">
			<!-- 경고 아이콘 -->
			<!-- {#if isAccountLinkedError} -->
				<!-- <div class="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
					<svg class="w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</div>
			{:else} -->
				<div class="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
					<svg class="w-10 h-10 text-yellow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 9V14M12 17.5V18M6.6 20H17.4C18.8 20 19.5 20 19.9 19.6C20.3 19.3 20.5 18.7 20.5 17.5L21.6 9.5C21.7 8.1 21.2 6.7 20.1 5.7C19.1 4.7 17.6 4.1 16.1 4.2L7.9 4.8C6.4 4.9 5 5.6 4 6.7C3 7.8 2.6 9.2 2.8 10.6L3.6 17.4C3.7 18.3 3.8 18.8 4 19.1C4.3 19.5 4.6 19.7 5.1 19.9C5.5 20 6 20 7 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			<!-- {/if} -->
			
			<!-- GuildPal 로고 및 제목 -->
			<div class="flex items-center mb-3">
				<img src="/images/guildpal_green.png" alt="GuildPal" class="h-7 mr-2" />
				<span class="text-xl font-bold text-[#4CAF50]">GuildPal</span>
			</div>
			
			<h2 class="text-xl font-semibold text-white mb-3">
				{#if isAccountLinkedError}
					Account Already Linked
				{:else}
					Authentication Error
				{/if}
			</h2>
			
			<p class="text-gray-300 mb-3">
				{errorMessage}
			</p>
			
			{#if isAccountLinkedError}
				<!-- <button 
					class="text-blue-400 text-sm underline mb-2 hover:text-blue-300 transition"
					on:click={toggleExplanation}
				>
					{showExplanation ? 'Hide explanation' : 'What does this mean?'}
				</button> -->
				
				{#if showExplanation}
					<div class="bg-[#111111] rounded-md p-3 mb-3 text-sm text-left">
						<p class="text-gray-300 mb-2">
							The {providerName} account you tried to link is already connected to a different GuildPal account.
						</p>
						<p class="text-gray-300">
							Options:
						</p>
						<ul class="list-disc pl-5 text-gray-300 text-xs space-y-1 mt-1">
							<li>Use a different {providerName} account to link to this GuildPal account</li>
							<li>Sign in to the GuildPal account that already has this {providerName} connected</li>
							<li>Contact support if you believe this is an error</li>
						</ul>
					</div>
				{/if}
			{/if}
			
			<div class="w-full border-t border-[#333333] my-3"></div>
			
			<div class="text-left w-full text-gray-400 text-xs mb-4">
				<p>Error Code: {error}</p>
			</div>
			
			<div class="flex flex-col sm:flex-row gap-3 w-full">
				{#if isAccountLinkedError}
					<button 
						class="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white py-2 px-4 rounded-md transition"
						on:click={goToAccount}
					>
						Manage Account
					</button>
					
					<!-- <button 
						class="flex-1 border border-[#666666] hover:border-[#999999] text-gray-300 py-2 px-4 rounded-md transition"
						on:click={goToSignIn}
					>
						Sign In
					</button> -->
				{:else}
					<button 
						class="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white py-2 px-4 rounded-md transition"
						on:click={goToAccount}
					>
						Manage Account
					</button>
					
					<button 
						class="flex-1 border border-[#666666] hover:border-[#999999] text-gray-300 py-2 px-4 rounded-md transition"
						on:click={goToHome}
					>
						Go to Home
					</button>
				{/if}
			</div>
		</div>
	</div>
</div> 