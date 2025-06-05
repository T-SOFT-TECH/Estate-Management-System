import { writable, type Writable } from 'svelte/store';
// import { supabase } from '$lib/supabaseClient'; // No longer using global client here for signOut
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  session: Session | null;
  loading: boolean; // True initially, set to false once layout data is processed
  error: string | null;
}

const initialState: UserState = {
  user: null,
  session: null,
  loading: true, // Start as true, +layout.svelte will update it once data from server is available
  error: null,
};

export const userStore: Writable<UserState> = writable(initialState);

// Function to sign out, now accepts a SupabaseClient instance
export async function signOut(supabaseClient: SupabaseClient) {
  userStore.update(s => ({ ...s, loading: true })); // Indicate loading during sign out

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    userStore.update(s => ({ ...s, error: error.message, loading: false }));
    console.error('Error signing out:', error.message);
  } else {
    // The onAuthStateChange listener in +layout.svelte should handle updating the store
    // to the signed-out state (user: null, session: null).
    // We can also proactively set it here for immediate UI feedback if desired,
    // but it might be redundant if the listener is quick.
    // Let's rely on the listener in +layout.svelte to update the store after signout.
    // Forcing loading to false here as the operation is done.
     userStore.update(s => ({ ...s, loading: false, user: null, session: null }));
  }
}

// All onAuthStateChange logic and initial session loading is REMOVED from here.
// It's now handled by:
// - `hooks.server.ts` (server-side session validation and user population)
// - `src/routes/+layout.server.ts` (passing session to client)
// - `src/routes/+layout.ts` (initializing client-side Supabase with server session)
// - `src/routes/+layout.svelte` (onAuthStateChange listener and store updates)

// The userStore is now primarily a reactive container that is updated by `+layout.svelte`.
// It can still be used by components throughout the app to react to user/session changes.
// Example: `$: console.log($userStore.user)` in a component.
// Components should not try to modify the auth state through this store directly, other than calling signOut().
// Login/signup actions are handled by components like Auth.svelte which use the Supabase client directly.

// To set the store initially (e.g. on page load after SSR):
// This is now done in +layout.svelte using the `data` prop from +layout.ts
/*
 Example from +layout.svelte:
  $: {
    if (data.session !== undefined && data.supabase !== undefined) {
       userStore.set({
         user: data.session?.user ?? null,
         session: data.session ?? null,
         loading: false,
         error: null
       });
    }
  }
*/

// The `loading` state meaning:
// - true: Initial app load, before +layout.server.ts and +layout.ts have resolved and passed session data.
//         Or, during an explicit async operation like signOut().
// - false: Session data has been processed (either session exists or it's confirmed null).
// `+layout.svelte` is responsible for setting loading to false once it receives `data`.
// And `signOut` sets it during its operation.
export default userStore;
