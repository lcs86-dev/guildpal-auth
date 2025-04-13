<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let isLoading: boolean = false;
  export let loadingWalletType: string = '';
  
  const dispatch = createEventDispatcher();
  
  function handleWalletSignIn(walletType: 'ronin' | 'metamask') {
    dispatch('wallet-signin', { walletType });
  }
</script>

<div class="space-y-3.5">
  <!-- Ronin Wallet login -->
  <button
    class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-[#111111] disabled:hover:bg-[#111111]"
    on:click={() => handleWalletSignIn('ronin')}
    disabled={isLoading}
  >
    {#if isLoading && loadingWalletType === 'Ronin Wallet'}
      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {:else}
      <img src="/images/ronin.png" alt="Ronin Wallet" class="w-5 h-5" />
    {/if}
    <span class="flex-grow text-center">
      Sign in with Ronin Wallet
    </span>
  </button>

  <!-- Metamask login -->
  <button
    class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-[#111111] disabled:hover:bg-[#111111]"
    on:click={() => handleWalletSignIn('metamask')}
    disabled={isLoading}
  >
    {#if isLoading && loadingWalletType === 'MetaMask'}
      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {:else}
      <img src="/images/metamask.png" alt="Metamask" class="w-5 h-5" />
    {/if}
    <span class="flex-grow text-center">
      Sign in with MetaMask
    </span>
  </button>
</div> 