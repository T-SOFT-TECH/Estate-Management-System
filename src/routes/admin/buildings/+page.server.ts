import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { Building } from '$lib/types/database';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
  // The hook already protects this route for admin users.
  // If for some reason a non-admin user reached this, or if user is null,
  // we could add an extra check here, but it's primarily the hook's job.
  if (!user) {
    throw redirect(303, '/login?redirect=/admin/buildings');
  }
  // Double check role if necessary, though hook should handle it.
  // if (user.app_metadata?.role !== 'admin') {
  //   throw redirect(303, '/unauthorized');
  // }

  const { data: buildings, error } = await supabase
    .from('buildings')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching buildings for admin:', error);
    // It's better to return an error object or status for the page to handle
    // than to throw here, unless it's a critical, unrecoverable error.
    return { buildings: [], error: error.message };
  }

  return { buildings: buildings as Building[] || [], error: null };
};
