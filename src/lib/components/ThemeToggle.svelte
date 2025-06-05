<script lang="ts">
  import { theme, toggleTheme } from '$lib/stores/themeStore';

  let currentTheme: string;
  theme.subscribe(value => {
    currentTheme = value;
  });
</script>

<button on:click={toggleTheme} aria-label="Toggle theme">
  {#if currentTheme === 'light'}
    <span>Light Mode</span>
    <!-- Optionally, use an icon for light mode -->
    <!-- <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364L3.409 7.191" /></svg> -->
  {:else}
    <span>Dark Mode</span>
    <!-- Optionally, use an icon for dark mode -->
    <!-- <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg> -->
  {/if}
</button>

<style>
  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: var(--button-background-color, #eee); /* Example variable */
    color: var(--button-text-color, #333); /* Example variable */
  }

  html.dark button {
    background-color: var(--button-background-color-dark, #444);
    color: var(--button-text-color-dark, #eee);
    border-color: #555;
  }
</style>
