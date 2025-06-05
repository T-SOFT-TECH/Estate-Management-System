import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

const THEME_KEY = 'theme';

// Helper function to get theme from localStorage
function getStoredTheme(): Theme | null {
  if (!browser) return null;
  const storedTheme = localStorage.getItem(THEME_KEY);
  return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null;
}

// Helper function to get system preference
function getSystemPreference(): Theme {
  if (!browser) return 'light'; // Default for SSR
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Initialize the store
const initialTheme = getStoredTheme() ?? getSystemPreference();
export const theme = writable<Theme>(initialTheme);

// Function to toggle the theme
export function toggleTheme() {
  theme.update((currentTheme) => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    if (browser) {
      localStorage.setItem(THEME_KEY, newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return newTheme;
  });
}

// Subscribe to theme changes to update localStorage and document class (if not already handled by toggle)
// This is important if the store is updated from elsewhere or on initial load.
if (browser) {
  theme.subscribe((currentTheme) => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, currentTheme);
  });

  // Initial class setting based on resolved theme
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Optional: Function to set a specific theme
export function setTheme(newTheme: Theme) {
  theme.set(newTheme);
  // The subscription will handle localStorage and document class updates
}
