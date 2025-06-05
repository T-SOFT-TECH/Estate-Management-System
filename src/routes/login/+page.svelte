<script lang="ts">
  import Auth from '$lib/components/Auth.svelte';
  import { userStore } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    // If user is already logged in, redirect them from the login page
    // to their profile or the homepage.
    if ($userStore.user && $userStore.session) {
      goto('/profile'); // Or perhaps '/'
    }

    // Subscribe to future changes as well, in case of auto-login via session restore
    const unsubscribe = userStore.subscribe(value => {
      if (value.user && value.session) {
        goto('/profile'); // Or perhaps '/'
      }
    });

    return () => {
      unsubscribe();
    };
  });
</script>

<svelte:head>
  <title>Login / Sign Up - Estate Management</title>
</svelte:head>

<div class="login-page-container">
  <h1>Access Your Account</h1>
  <Auth />
</div>

<style>
  .login-page-container {
    padding-top: 2rem; /* Add some space from the header */
    /* Styles for the container of the Auth component on the login page */
  }
  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }
</style>
