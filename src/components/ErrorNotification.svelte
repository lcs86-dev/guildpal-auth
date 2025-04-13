<script>
  export let show = false;
  export let title = "Error";
  export let message = "";
  export let onClose = () => {};
  export let autoDismiss = true;
  export let dismissDuration = 5000;
  
  import { onMount, createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let timer;
  
  $: if (show && autoDismiss) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      handleClose();
    }, dismissDuration);
  }
  
  onMount(() => {
    return () => {
      clearTimeout(timer);
    };
  });
  
  function handleClose() {
    clearTimeout(timer);
    dispatch('close');
    onClose();
  }
</script>

{#if show}
  <div class="fixed top-4 inset-x-0 flex justify-center items-start z-50 px-4">
    <div class="bg-[#2D0709] text-[#F87171] p-4 rounded-lg shadow-lg border border-[#F87171]/20 max-w-md w-full flex items-start animate-slideDown">
      <svg class="w-5 h-5 flex-shrink-0 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <div class="flex-1">
        <div class="font-medium mb-1">{title}</div>
        <p class="text-sm opacity-90">{message}</p>
      </div>
      <button 
        class="ml-4 text-[#F87171]/80 hover:text-[#F87171] flex-shrink-0"
        on:click={handleClose}
      >
        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
{/if}

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