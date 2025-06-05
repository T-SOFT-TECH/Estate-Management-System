import { writable, type Writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { browser } from '$app/environment';

interface UserState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  session: null,
  loading: true,
  error: null,
};

export const userStore: Writable<UserState> = writable(initialState);

// Function to sign out
export async function signOut() {
  userStore.update(s => ({ ...s, loading: true }));
  const { error } = await supabase.auth.signOut();
  if (error) {
    userStore.update(s => ({ ...s, error: error.message, loading: false }));
    console.error('Error signing out:', error.message);
  } else {
    // userStore will be updated by onAuthStateChange
    // but we can clear it immediately for faster UI update
    userStore.set({ user: null, session: null, loading: false, error: null });
  }
}


if (browser) {
  // Set loading to true initially when the store is created on the client
  userStore.set({ ...initialState, loading: true });

  // Check for existing session on initial load
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      userStore.set({ user: null, session: null, loading: false, error: error.message });
      console.error('Error getting initial session:', error.message);
    } else if (session) {
      userStore.set({ user: session.user, session, loading: false, error: null });
    } else {
      // No active session
      userStore.set({ user: null, session: null, loading: false, error: null });
    }
  }).catch(e => {
      // Catch any unexpected error during getSession
      console.error("Exception in getSession:", e);
      userStore.set({ user: null, session: null, loading: false, error: "Failed to get session" });
  });

  // Listen to authentication state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth event:', event, session);
      if (event === 'INITIAL_SESSION') {
        // Handled by getSession above, but good to be explicit
        userStore.set({ user: session?.user ?? null, session, loading: false, error: null });
      } else if (event === 'SIGNED_IN') {
        userStore.set({ user: session!.user, session, loading: false, error: null });
      } else if (event === 'SIGNED_OUT') {
        userStore.set({ user: null, session: null, loading: false, error: null });
      } else if (event === 'PASSWORD_RECOVERY') {
        // User is in password recovery state, not yet signed in
        userStore.update(s => ({ ...s, loading: false, error: null }));
      } else if (event === 'TOKEN_REFRESHED') {
        userStore.set({ user: session!.user, session, loading: false, error: null });
      } else if (event === 'USER_UPDATED') {
        userStore.set({ user: session!.user, session, loading: false, error: null });
      }
      // Add more event handling if needed (e.g., MFA_CHALLENGE)
    }
  );

  // SvelteKit specific: an effect to unsubscribe when the component/app is destroyed
  // This is typically handled automatically by Svelte stores in components,
  // but for a global listener like this, ensure it's managed if needed.
  // For onAuthStateChange, Supabase handles its own cleanup when the client is no longer used.
  // However, if we were creating a manual subscription here, we'd need this:
  // onDestroy(() => {
  //   if (subscription) {
  //     subscription.unsubscribe();
  //   }
  // });
}

// Export a derived store for easier access to just the user object or loading state
// import { derived } from 'svelte/store';
// export const currentUser = derived(userStore, $userStore => $userStore.user);
// export const isLoadingAuth = derived(userStore, $userStore => $userStore.loading);
