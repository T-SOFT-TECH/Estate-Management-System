<script lang="ts">
  import { page } from '$app/stores'; // To get supabase client from layout data
  import { userStore, signOut as userSignOutExternal } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import type { SupabaseClient } from '@supabase/supabase-js';

  // $: supabase = $page.data.supabase; // Get the Supabase client reactively

  let email = '';
  let password = '';
  let loading = false;
  let message = '';
  let error = '';

  let showSignIn = true; // Toggle between Sign In and Sign Up form

  // Helper to get the Supabase client instance from page data
  function getSupabaseClient(): SupabaseClient {
    // $: is not allowed in functions, so we access $page directly or pass client as prop
    // For components, it's often better to pass `supabase` as a prop if possible,
    // or ensure $page.data.supabase is available when functions are called.
    if (!$page.data.supabase) {
      throw new Error("Supabase client not available. Ensure it's passed in page data from +layout.ts");
    }
    return $page.data.supabase;
  }

  async function handleSignIn() {
    loading = true;
    message = '';
    error = '';
    const supabaseClient = getSupabaseClient();
    try {
      const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (signInError) {
        console.error('Sign-in error:', signInError.message);
        error = signInError.message || 'Invalid login credentials.';
      } else if (data.user) {
        // userStore will be updated by onAuthStateChange in root layout
        message = 'Signed in successfully! Redirecting...';
        await goto('/profile'); // Redirect to a protected route
      } else {
        error = 'An unexpected error occurred during sign in.';
      }
    } catch (e: any) {
      console.error('Exception during sign-in:', e.message);
      error = e.message || 'An unexpected error occurred.';
    } finally {
      loading = false;
    }
  }

  async function handleSignUp() {
    loading = true;
    message = '';
    error = '';
    const supabaseClient = getSupabaseClient();
    try {
      const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        // options: { emailRedirectTo: `${location.origin}/auth/confirm` } // Standard confirm path
      });
      if (signUpError) {
        console.error('Sign-up error:', signUpError.message);
        error = signUpError.message || 'Could not sign up user.';
        if (signUpError.message.toLowerCase().includes("already exists")) {
            error = "User already exists. Try signing in.";
        }
      } else if (data.user?.identities?.length === 0) {
        error = 'User already exists but is unconfirmed. Please check your email for a confirmation link or try signing in.';
      } else if (data.user) {
        // userStore will be updated by onAuthStateChange in root layout
        message = 'Signed up successfully! Please check your email for a confirmation link if required, then sign in.';
        showSignIn = true; // Switch to sign-in form
      } else {
         error = 'An unexpected error occurred during sign up.';
      }
    } catch (e: any) {
      console.error('Exception during sign-up:', e.message);
      error = e.message || 'An unexpected error occurred.';
    } finally {
      loading = false;
    }
  }

  async function handleSignOut() {
    loading = true;
    error = '';
    message = '';
    const supabaseClient = getSupabaseClient();
    await userSignOutExternal(supabaseClient); // Pass the client to the external signOut function
    message = 'Signed out successfully.';
    loading = false;
  }

  // If user is already logged in, perhaps redirect them or show a different UI
  // This component is primarily for login/signup action.
  // onMount(() => {
  //   if ($userStore.user) {
  //     // User is already logged in, redirect from /login page for example
  //     // This logic might be better suited for the /login page itself
  //   }
  // });
</script>

<div class="auth-container">
  {#if $userStore.user}
    <div>
      <p>You are currently logged in as: {$userStore.user.email}</p>
      <button on:click={handleSignOut} disabled={loading}>
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  {:else}
    <h2>{showSignIn ? 'Sign In' : 'Create Account'}</h2>
    <form on:submit|preventDefault={showSignIn ? handleSignIn : handleSignUp}>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" bind:value={email} required disabled={loading} />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" bind:value={password} required disabled={loading} />
      </div>
      {#if error}
        <p class="error-message">{error}</p>
      {/if}
      {#if message}
        <p class="success-message">{message}</p>
      {/if}
      <button type="submit" disabled={loading}>
        {loading ? (showSignIn ? 'Signing In...' : 'Creating Account...') : (showSignIn ? 'Sign In' : 'Create Account')}
      </button>
    </form>
    <button on:click={() => { showSignIn = !showSignIn; error = ''; message = ''; }} disabled={loading}>
      {showSignIn ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
    </button>
  {/if}
</div>

<style>
  .auth-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--background-color); /* Respects dark mode */
  }
  h2 {
    text-align: center;
    color: var(--heading-color);
    margin-bottom: 1.5rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color);
  }
  input[type="email"],
  input[type="password"] {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    box-sizing: border-box;
    background-color: var(--background-color); /* Input background for theming */
    color: var(--text-color); /* Input text color for theming */
  }
  input[type="email"]:focus,
  input[type="password"]:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-color-translucent, rgba(0, 123, 255, 0.25)); /* Use a translucent primary color */
  }
  button {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
  }
  button:disabled {
    background-color: var(--secondary-color);
    cursor: not-allowed;
  }
  button:not(:disabled):hover {
    background-color: var(--link-hover-color);
  }
  button[type="submit"] {
    margin-bottom: 1rem; /* Space between main action and toggle button */
  }
  .error-message {
    color: #dc3545; /* Standard error color */
    margin-bottom: 1rem;
    text-align: center;
  }
  .success-message {
    color: #28a745; /* Standard success color */
    margin-bottom: 1rem;
    text-align: center;
  }

  /* Style for the toggle button to look less primary */
  button:not([type="submit"]) {
    background-color: transparent;
    color: var(--link-color);
    border: 1px solid var(--border-color);
  }
  html.dark button:not([type="submit"]) {
     color: var(--link-color); /* Ensure link color is used in dark mode */
     border-color: var(--border-color);
  }
  button:not([type="submit"]):hover {
    background-color: var(--light-gray); /* Subtle hover for secondary button */
  }
  html.dark button:not([type="submit"]):hover {
    background-color: var(--medium-gray);
  }
</style>
