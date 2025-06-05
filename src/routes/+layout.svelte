<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { theme as themeStore } from '$lib/stores/themeStore'; // For theme
  import { userStore } from '$lib/stores/userStore'; // Still useful for app-wide reactivity
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { invalidate } from '$app/navigation';
  import type { LayoutData } from './$types'; // Import LayoutData type

  import '../app.css';

  // Props from +layout.ts (and +layout.server.ts)
  export let data: LayoutData;

  // $: ({ supabase, session } = data); // Destructure from data, reactive

  // Update userStore whenever session from data changes
  $: {
    if (data.session !== undefined && data.supabase !== undefined) {
       // Initialize or update userStore with session and user from LayoutData
       // The user object might be directly on data.user if passed from +layout.server.ts
       // or can be fetched if needed. For simplicity, assume data.session implies user for now.
       // The userStore's internal onAuthStateChange might become redundant if this covers all cases.
       // However, userStore can still consolidate and provide reactive $userStore.user, $userStore.session

       // Let's ensure userStore is updated with the session from SSR
       // This is a simplified update; userStore might need more refined logic
       // to integrate with @supabase/ssr fully, especially around its own onAuthStateChange.
       // For now, we'll directly pass the session to userStore.
       userStore.set({
         user: data.session?.user ?? null,
         session: data.session ?? null,
         loading: false, // Assuming loading is complete if we have data from +layout.ts
         error: null
       });
    }
  }

  onMount(() => {
    // Theme initialization
    if (browser) {
      const currentTheme = localStorage.getItem('theme') || ($themeStore === 'dark' ? 'dark' : 'light');
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Supabase Auth Listener from SSR guide
    const {
      data: { subscription },
    } = data.supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession?.expires_at !== data.session?.expires_at) {
        invalidate('supabase:auth'); // Re-run all load functions that depend on 'supabase:auth'
      }
      // Additionally, update the userStore when auth state changes client-side
      // This ensures Nav and other components react immediately if they use userStore
      userStore.set({
        user: newSession?.user ?? null,
        session: newSession ?? null,
        loading: false,
        error: null
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  });

</script>

<div class="app-container">
  <header> {/* Removed loading class based on userStore, as session is handled by SSR now */}
    <Nav /> {/* Nav component itself subscribes to userStore, which is now updated by this layout */}
    <div class="header-actions">
      <ThemeToggle />
    </div>
  </header>

  <main>
    {#if $userStore.loading && !$userStore.session && !data.session }
      <!-- Show loading only if SSR hasn't provided a session and store is also loading -->
      <!-- This condition might need refinement based on how userStore.loading behaves with SSR -->
      <div class="loading-fullscreen">
        <p>Loading application...</p>
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
