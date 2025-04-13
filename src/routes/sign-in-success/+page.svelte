<!-- src/routes/success/+page.svelte -->
<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let email = '';

	onMount(() => {
		// Get email from query parameters or use a default
		email = $page.url.searchParams.get('email') || 'PGA123@gmail.com';
	});

	function handleConfirm() {
		// Logic to handle confirm action (e.g., close window or redirect)
		window.location.href = '/';
	}
</script>

<div class="flex justify-center items-center w-full max-w-md mx-auto">
	<!-- Modal container with shadow -->
	<div class="w-full relative">
		<!-- Outer container with rounded corners - exact color from Figma (#1A1A1A) -->
		<div class="bg-[#1A1A1A] rounded-3xl shadow-xl overflow-hidden">
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

				<!-- Success message with exact text and spacing -->
				<h2 class="text-xl text-white mb-1 text-center">You have successfully logged in.</h2>
				<p class="text-gray-400 mb-8 text-center text-sm">Clicking 'Confirm' will close the window.</p>

				<!-- Email badge with proper styling - exact color from Figma (#333333) -->
				<div class="bg-[#333333] text-[#4CAF50] px-10 py-2 rounded-full text-center w-full max-w-xs">
					{email}
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
	</div>
</div>
