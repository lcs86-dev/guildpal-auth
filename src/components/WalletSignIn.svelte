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
  <!-- Google login -->
  <button
    class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base"
    disabled={isLoading}
  >
    <img src="/images/google.png" alt="Google" class="w-5 h-5" />
    <span class="flex-grow text-center">Sign in with Google</span>
  </button>

  <!-- Ronin Wallet login -->
  <button
    class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base"
    on:click={() => handleWalletSignIn('ronin')}
    disabled={isLoading}
  >
    <img src="/images/ronin.png" alt="Ronin Wallet" class="w-5 h-5" />
    <span class="flex-grow text-center">
      {#if isLoading && loadingWalletType === 'Ronin Wallet'}
        Signing in...
      {:else}
        Sign in with Ronin Wallet
      {/if}
    </span>
  </button>

  <!-- Metamask login -->
  <button
    class="w-full py-3.5 px-5 rounded-xl border border-[#333333] bg-[#1A1A1A] text-white font-medium flex items-center justify-between hover:bg-[#262626] transition text-base"
    on:click={() => handleWalletSignIn('metamask')}
    disabled={isLoading}
  >
    <img src="/images/metamask.png" alt="Metamask" class="w-5 h-5" />
    <span class="flex-grow text-center">
      {#if isLoading && loadingWalletType === 'MetaMask'}
        Signing in...
      {:else}
        Sign in with MetaMask
      {/if}
    </span>
  </button>
</div> 