import { createBrowserClient, isBrowser, parseSvelteKitCookie } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
  /**
   * Declare a dependency so the layout can be invalidated,
   * for example, on session refresh.
   */
  depends('supabase:auth');

  // Initialize the Supabase client.
  // createBrowserClient is safe to call on the server, but will return a plain client.
  // On the browser, it will be a full client that can manage auth state.
  // The key is that it's initialized with the session data passed from the server via +layout.server.ts -> data property.

  // The `data` object contains `session` and `user` from `+layout.server.ts`.
  // The `parseSvelteKitCookie` function is used by `createBrowserClient` internally when cookies are available,
  // but for initializing with a session from server, we pass the initialSession.

  const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      fetch,
    },
    cookies: {
      // For the browser client, cookie handling is managed by the browser itself,
      // but `createBrowserClient` can use these stubs if it needs to interact with cookies directly
      // in some scenarios (though typically it relies on localStorage and events for browser).
      // The server-side session is passed via `data.session`.
      getAll: () => {
        if (!isBrowser()) {
          // This case should ideally not be hit if createBrowserClient is used appropriately,
          // as server-side client is handled by hooks.server.ts.
          // However, if called on server, it would need access to cookies from `data` if passed.
          // For this setup, we rely on initialSession for server-rendered state.
          return data.session ? [ { name: 'sb-access-token', value: data.session.access_token }] : [];
        }
        return document.cookie.split('; ').map(c => {
          const [name, ...rest] = c.split('=');
          return { name, value: rest.join('=') };
        });
      },
    },
    // Pass the session from the server to initialize the client's auth state
    // This is crucial for the client to be aware of the session immediately on load
    // without waiting for an async getSession() call.
    auth: {
        // flowType: 'pkce', // PKCE is default, ensure it matches your Supabase project settings
        // autoRefreshToken: isBrowser(), // Enable auto refresh only on client
        // detectSessionInUrl: isBrowser(), // Enable only on client
        // persistSession: isBrowser(), // Persist session only on client
    }
  });


  // Attempt to get the session client-side.
  // If `data.session` was passed from the server, this should quickly resolve.
  // If on client and no server session, it might try to recover from localStorage or URL.
  const { data: { session: currentSession } } = await supabase.auth.getSession();

  // If the server-provided session and client-side session differ, or if server had no session but client does,
  // it might indicate a state change that `onAuthStateChange` in `+layout.svelte` will handle by invalidating.

  return {
    supabase,
    session: data.session, // Pass the session from server load to ensure consistency initially
    // user: data.user // Pass user from server load
  };
};
