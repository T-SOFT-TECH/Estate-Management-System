<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { theme as themeStore } from '$lib/stores/themeStore'; // Renamed to avoid conflict
  import { userStore } from '$lib/stores/userStore'; // Import user store
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import '../app.css';

  // This onMount is for theme initialization.
  // userStore handles its own initialization and onAuthStateChange listening.
  onMount(() => {
    if (browser) {
      // Initialize theme from localStorage or system preference
      const currentTheme = localStorage.getItem('theme') || ($themeStore === 'dark' ? 'dark' : 'light');
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  });

  // Optional: Log user state for debugging in layout
  // userStore.subscribe(value => {
  //   console.log('Layout userStore:', value);
  // });
</script>

<div class="app-container">
  <!-- Header might need to react to $userStore.loading for a global loader -->
  <header class:loading={$userStore.loading}>
    <Nav />
    <div class="header-actions">
      <ThemeToggle />
      <!-- Potentially other global actions here -->
    </div>
  </header>

  <main>
    {#if $userStore.loading && !$userStore.session}
      <div class="loading-fullscreen">
        <p>Loading session...</p>
        <!-- Add a spinner or loading animation here -->
      </div>
    {:else}
      <slot />
    {/if}
  </main>

  <footer>
    <p>&copy; {new Date().getFullYear()} Estate Management</p>
  </footer>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--background-color); /* Ensure header has background for theme */
    transition: background-color 0.3s ease;
  }
  /* Optional: style for header when loading auth state */
  /* header.loading {
    opacity: 0.8;
  } */

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem; /* Space between ThemeToggle and other potential items */
  }

  main {
    flex-grow: 1;
    padding: 1rem;
    background-color: var(--background-color); /* Ensure main has background for theme */
    transition: background-color 0.3s ease;
  }

  .loading-fullscreen {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 150px); /* Adjust based on header/footer height */
    font-size: 1.5rem;
    color: var(--text-color);
  }

  footer {
    text-align: center;
    padding: 1rem;
    background-color: var(--light-gray);
    border-top: 1px solid var(--border-color);
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  html.dark footer {
    background-color: var(--medium-gray); /* Adjusted for consistency */
    border-top: 1px solid var(--border-color);
  }
</style>
