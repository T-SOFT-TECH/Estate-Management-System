import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { VisitorPreregistration } from '$lib/types/database';

export const load: PageServerLoad = async ({ locals: { supabase, user, session }, url }) => {
  // Admin role check (primary protection by hooks.server.ts, this is an additional safeguard)
  if (!session || !user || user.app_metadata?.role !== 'admin') {
    // It's possible user is null if session exists but getUser() failed in safeGetSession
    // hooks.server.ts should ideally redirect before this, but good to double check.
    throw redirect(303, '/unauthorized');
  }

  // Determine the date to filter by: query param or today
  const queryDate = url.searchParams.get('date');
  let targetDate: Date;

  if (queryDate) {
    targetDate = new Date(queryDate);
    if (isNaN(targetDate.getTime())) {
      // Invalid date in query param, default to today
      targetDate = new Date();
    }
  } else {
    targetDate = new Date();
  }

  // Format date as YYYY-MM-DD for Supabase query
  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const dd = String(targetDate.getDate()).padStart(2, '0');
  const formattedTargetDate = `${yyyy}-${mm}-${dd}`;

  // Fetch pre-registrations for the target date with status 'pending' or 'active'
  // Also fetch basic user info (email as a proxy for name/contact) for the resident
  const { data: daily_registrations, error } = await supabase
    .from('visitor_preregistrations')
    .select(`
      *,
      resident:resident_user_id ( email )
    `) // Example of fetching related user email
    .eq('expected_date', formattedTargetDate)
    .in('status', ['pending', 'active']) // Fetch both pending and active (checked-in)
    .order('expected_time', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching daily visitor pre-registrations:', error);
    return {
      daily_registrations: [] as (VisitorPreregistration & { resident: { email: string } | null })[],
      error: 'Failed to load daily visitor data.',
      selectedDate: formattedTargetDate,
    };
  }

  // The resident type above indicates that 'resident' can be an object { email: string } or null
  // if the join fails or no resident is found.
  type RegistrationWithResident = VisitorPreregistration & { resident: { email: string } | null };

  return {
    daily_registrations: daily_registrations as RegistrationWithResident[] || [],
    error: null,
    selectedDate: formattedTargetDate,
  };
};

// Stretch Goal: checkInVisitor action would go here if implemented.
// For now, focusing on the read-only list.
/*
export const actions: Actions = {
  checkInVisitor: async ({ request, locals: { supabase, user, session } }) => {
    // ... implementation ...
  }
};
*/
