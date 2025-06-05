<script lang="ts">
  import { userStore } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let currentUserEmail: string | undefined = undefined;
  let sessionLoading = true;

  onMount(() => {
    const unsubscribe = userStore.subscribe(value => {
      sessionLoading = value.loading;
      if (!value.loading) { // Only check/redirect once loading is false
        if (!value.user || !value.session) {
          goto('/login');
        } else {
          currentUserEmail = value.user.email;
        }
      }
    });

    // If already not loading and no user on mount (e.g. store initialized quickly)
    if (!$userStore.loading && !$userStore.user) {
        goto('/login');
    }


    return () => {
      unsubscribe();
    };
  });
</script>

<svelte:head>
  <title>My Profile - Estate Management</title>
</svelte:head>

<div class="profile-page-container">
  {#if sessionLoading}
    <p>Loading profile...</p>
  {:else if currentUserEmail}
    <h1>User Profile</h1>
    <p>Welcome, you are logged in as: <strong>{currentUserEmail}</strong></p>
    <p>This is your personal profile page. More features to come!</p>
    <!-- Add more profile information or actions here -->
  {:else}
    <!-- This state should ideally not be reached due to redirect, but as a fallback -->
    <p>You are not logged in. Redirecting...</p>
  {/if}
</div>

<style>
  .profile-page-container {
    padding: 2rem;
    max-width: 800px;
    margin: 2rem auto;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
  }
  h1 {
    color: var(--heading-color);
    margin-bottom: 1.5rem;
  }
  p {
    color: var(--text-color);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  strong {
    font-weight: 600;
  }
</style>
