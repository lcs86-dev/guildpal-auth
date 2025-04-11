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

<div class="flex min-h-screen w-full">
	<!-- Left side with background image (hidden on mobile) -->
	<div
		class="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-900 via-green-700 to-blue-900 relative overflow-hidden"
	>
		<div class="absolute inset-0 bg-[url('/guildpal-pattern.svg')] opacity-20"></div>
		<div class="absolute top-0 left-0 w-full h-full flex flex-col justify-center">
			<!-- Text is explicitly positioned to the left with padding -->
			<div class="pl-12 pr-12">
				<div class="welcome-text text-left">
					<p class="text-5xl font-bold text-white">Welcome<br />Back to GuilPal.</p>
					<p class="text-xl text-white/90 mt-4">A new quest begins now. Are you in?</p>
				</div>
			</div>
		</div>
	</div>
	<!-- Right side with content that changes based on route -->
	<div class="w-full md:w-1/2 bg-slate-900 flex flex-col">
		<div class="flex-grow flex flex-col items-center justify-center p-6 md:p-12">
			<!-- Content will be injected here -->
			<slot />
		</div>

		<!-- Footer - consistent across all pages -->
		<div class="p-4 flex justify-between w-full text-xs text-gray-500">
			<div>© 2025 PGA Platform</div>
			<div>
				Do you need help with logging in? <a href="/support" class="underline hover:text-gray-300"
					>Support</a
				>
			</div>
		</div>
	</div>
</div>
