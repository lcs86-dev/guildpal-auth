<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let email: string = '';
  export let code: string = '';
  export let emailError: string = '';
  export let codeError: string = '';
  export let isEmailVerified: boolean = false;
  export let isVerifying: boolean = false;
  export let isSigningIn: boolean = false;
  export let showSuccessMessage: boolean = false;
  export let verificationFailed: boolean = false;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();

  export function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function handleVerifyEmail(): void {
    // 오류 메시지 초기화
    emailError = '';
    
    // 기본 검증만 수행
    if (!email) {
      emailError = 'Please enter your email.';
      return;
    }

    if (!validateEmail(email)) {
      emailError = 'Please enter a valid email address.';
      return;
    }

    // 부모 컴포넌트에 이벤트 발생
    console.log('Dispatching verify-email event with:', email);
    dispatch('verify-email', { email });
  }

  function handleSignIn(): void {
    console.log('Dispatching sign-in event with:', { email, code });
    dispatch('sign-in', { email, code });
  }
</script>

<form class="space-y-5" on:submit|preventDefault={handleSignIn}>
  <!-- Email input with verify button -->
  <div class="space-y-1">
    <div class="relative">
      <input
        id="email"
        type="email"
        bind:value={email}
        placeholder="Please enter your email."
        class={`w-full p-3.5 pl-4 rounded-xl bg-[#1A1A1A] border 
          ${
            emailError
              ? 'border-red-500 focus:ring-red-500'
              : isEmailVerified
                ? 'border-[#4CAF50] focus:ring-[#4CAF50]'
                : 'border-[#333333] focus:ring-[#4CAF50]'
          } 
          text-white focus:outline-none focus:ring-2 pr-32 text-base`}
        disabled={isVerifying || isEmailVerified || disabled}
      />
      <button
        type="button"
        on:click={handleVerifyEmail}
        disabled={isVerifying || isEmailVerified || disabled}
        class={`absolute right-2.5 top-2 bottom-2 px-4 rounded-lg transition flex items-center justify-center min-w-[105px]
          ${
            isVerifying
              ? 'bg-[#1A1A1A] text-[#4CAF50] cursor-not-allowed'
              : isEmailVerified
                ? 'bg-[#262626] text-[#4CAF50] cursor-not-allowed'
                : verificationFailed
                  ? 'bg-[#262626] text-red-400 hover:bg-[#333333]'
                  : 'bg-[#262626] text-white hover:bg-[#333333]'
          }`}
      >
        {#if isVerifying}
          <svg
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#4CAF50]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Sending...
        {:else if isEmailVerified}
          <svg class="h-4 w-4 text-[#4CAF50] mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          Sent
        {:else if verificationFailed}
          <svg class="h-4 w-4 text-red-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          Try Again
        {:else}
          Verify Email
        {/if}
      </button>
    </div>

    {#if emailError}
      <p class="text-red-500 text-sm pl-1 flex items-center">
        <svg class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        {emailError}
      </p>
    {/if}

    {#if showSuccessMessage}
      <p class="text-[#4CAF50] text-sm pl-1 flex items-center">
        <svg class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        Verification code sent to your email.
      </p>
    {/if}
  </div>

  <!-- Verification code input -->
  <div class="space-y-1">
    <input
      id="code"
      type="text"
      bind:value={code}
      placeholder="Enter Verification Code."
      class={`w-full p-3.5 pl-4 rounded-xl bg-[#1A1A1A] border 
        ${codeError ? 'border-red-500 focus:ring-red-500' : 'border-[#333333] focus:ring-[#4CAF50]'} 
        text-white focus:outline-none focus:ring-2 text-base`}
      disabled={!isEmailVerified || isSigningIn || disabled}
    />

    {#if codeError}
      <p class="text-red-500 text-sm pl-1 flex items-center">
        <svg class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        {codeError}
      </p>
    {/if}
  </div>

  <!-- Sign in button -->
  <button
    type="submit"
    disabled={!isEmailVerified || isSigningIn || disabled}
    class={`w-full py-3.5 rounded-xl text-white font-medium transition mt-2 text-base
      ${
        !isEmailVerified || disabled
          ? 'bg-[#4CAF50]/50 cursor-not-allowed'
          : isSigningIn
            ? 'bg-[#4CAF50]/70 cursor-wait'
            : 'bg-[#4CAF50] hover:opacity-90'
      }`}
  >
    {#if isSigningIn}
      <span class="flex items-center justify-center">
        <svg
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Signing in...
      </span>
    {:else}
      Sign in
    {/if}
  </button>
</form> 