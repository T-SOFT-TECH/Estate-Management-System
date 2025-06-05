<script lang="ts">
  import { userStore, signOut } from '$lib/stores/userStore';
  import { page } from '$app/stores'; // To highlight active link

  async function handleSignOut() {
    await signOut();
    // userStore will update and UI will react.
    // No need to redirect here, usually handled by page/layout watching userStore
  }
</script>

<nav>
  <ul>
    <li><a href="/" class:active={$page.url.pathname === '/'}>Home</a></li>
    <li><a href="/buildings" class:active={$page.url.pathname.startsWith('/buildings')}>Buildings</a></li>
    {#if $userStore.user}
      <li><a href="/profile" class:active={$page.url.pathname === '/profile'}>Profile</a></li>
      <li>
        <button on:click={handleSignOut} class="logout-button">
          {#if $userStore.loading}Signing out...{:else}Sign Out{/if}
        </button>
      </li>
    {:else}
      <li><a href="/login" class:active={$page.url.pathname === '/login'}>Login</a></li>
    {/if}
    <!-- Add more links as needed -->
  </ul>
</nav>

<style>
  nav {
    /* background-color: #f0f0f0; */ /* Replaced by var in layout or global */
    /* padding: 1rem; */ /* Handled by header in layout */
    background-color: var(--light-gray);
    display: flex;
    justify-content: space-between; /* Pushes ul to one side if needed */
    align-items: center;
    /* border-bottom: 1px solid var(--border-color); */ /* Removed as header has border */
  }

  html.dark nav {
    background-color: var(--medium-gray); /* Example for dark mode */
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
  }
  li {
    margin-right: 1rem;
  }
  li:last-child {
    margin-right: 0;
  }
  a {
    text-decoration: none;
    color: var(--text-color); /* Use theme variable */
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }
  a:hover, a.active {
    color: var(--primary-color); /* Use theme variable */
    background-color: rgba(var(--primary-color-rgb, 0, 123, 255), 0.1); /* Needs --primary-color-rgb or adjust */
  }

  html.dark a {
    color: var(--text-color);
  }
  html.dark a:hover, html.dark a.active {
    color: var(--primary-color);
     background-color: rgba(var(--primary-color-rgb-dark, 59, 130, 246), 0.15); /* Needs --primary-color-rgb-dark or adjust */
  }

  .logout-button {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    font-size: inherit; /* Inherit font size from surrounding elements */
    font-family: inherit;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }
  .logout-button:hover {
    color: var(--primary-color);
    background-color: rgba(var(--primary-color-rgb, 0, 123, 255), 0.1);
  }
  html.dark .logout-button {
    color: var(--text-color);
  }
  html.dark .logout-button:hover {
     color: var(--primary-color);
     background-color: rgba(var(--primary-color-rgb-dark, 59, 130, 246), 0.15);
  }

  /* Define --primary-color-rgb for background opacity effect if not globally available */
  :root {
    /* Example: if --primary-color is #007bff */
    --primary-color-rgb: 0, 123, 255;
    /* Example: if --primary-color for dark is #3b82f6 */
    --primary-color-rgb-dark: 59, 130, 246;
  }
</style>
