<!-- <script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div>
	<main>
		{@render children()}
	</main>
</div>

<style>
</style> -->

<!-- src/routes/+layout.svelte -->
<script>
	import '../app.css';
</script>

<div class="flex min-h-screen w-full p-8 bg-black">
	<!-- Left side with background image (hidden on mobile) -->
	<div class="hidden md:block md:w-1/2 relative">
		<!-- Container with rounded corners for the image -->
		<div class="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl">
			<!-- Background image -->
			<div 
				class="absolute inset-0 bg-cover bg-center" 
				style="background-image: url('/images/welcome_guildpal_bg.png');"
			></div>
		</div>
	</div>
	
	<!-- Right side with content that changes based on route -->
	<div class="w-full md:w-1/2 bg-black flex flex-col">
		<div class="flex-grow flex flex-col items-center justify-center p-6 md:p-12">
			<!-- Content will be injected here -->
			<slot />
		</div>

		<!-- Footer - consistent across all pages -->
		<div class="px-6 flex justify-between w-full text-xs text-white">
			<div>©2025 PGA Platform</div>
			<div class="flex items-center">
				<span>Do you need help with logging in?</span>
				<a href="/support" class="text-white ml-1 underline">Support</a>
			</div>
		</div>
	</div>
</div>
