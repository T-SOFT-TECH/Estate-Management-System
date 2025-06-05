import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
  // Fetch user and session using safeGetSession
  const { session, user } = await safeGetSession();

  // It's important to return the session and user,
  // so they are available in +layout.ts and subsequently in page data
  // for client-side Supabase client initialization and reactive updates.

  // Supabase client is already available in locals on the server,
  // but if you need to pass specific data fetched with it, you can do so here.
  // We don't pass the raw event.cookies here as shown in some older examples,
  // because the client in +layout.ts will get it from this `session` data
  // (specifically, the access_token within the session is what matters for the client).

  return {
    session,
    user, // Pass user data as well
  };
};
