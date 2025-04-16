<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { initializeMid } from '$lib/stores/pga';

	onMount(async () => {
		// 페이지 로드 시 MID 초기화
		const midData = await initializeMid();
		if (midData) {
			console.log('MID initialized:', midData);
		} else {
			console.log('MID not initialized');
		}
	});
</script>

<div class="flex min-h-screen w-full p-8 bg-black">
	<!-- Left side with background image (hidden on mobile) -->
	<div class="hidden md:block md:w-1/2 relative">
		<!-- Container with rounded corners for the image -->
		<div class="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl">
			<!-- Background image -->
			<img 
				src="/images/welcome_guildpal_bg.png"
				alt="GuildPal Background"
				class="absolute inset-0 w-full h-full object-fill"
			/>
			
			<!-- Welcome text overlay -->
			<div class="absolute inset-0 flex flex-col justify-center items-start p-12 z-10">
				<div class="w-full">
					<div class="w-full">
						<p class="text-white text-6xl font-bold leading-tight mb-0 text-left">Welcome</p>
						<p class="text-white text-6xl font-bold leading-tight -mt-4 text-left">Back to GuilPal.</p>
					</div>
					<p class="text-white text-xl text-left pt-4">
						A new quest begins now. Are you in?
					</p>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Right side with content that changes based on route -->
	<div class="w-full md:w-1/2 bg-black flex flex-col">
		<div class="flex-grow flex flex-col items-center justify-center p-6 md:p-12">
			<!-- Content will be injected here -->
			<slot />
		</div>

		<!-- Footer - consistent across all pages -->
		<!-- <div class="px-6 flex justify-between w-full text-xs text-white">
			<div>©2025 PGA Platform</div>
			<div class="flex items-center">
				<span>Do you need help with logging in?</span>
				<a href="/support" class="text-white ml-1 underline">Support</a>
			</div>
		</div> -->
	</div>
</div>