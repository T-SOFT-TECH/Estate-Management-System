import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import type { VisitorPreregistration } from '$lib/types/database';

export const load: PageServerLoad = async ({ locals: { supabase, session, user } }) => {
  if (!session || !user) {
    throw redirect(303, '/login?redirect=/visitors');
  }

  const { data: preregistrations, error } = await supabase
    .from('visitor_preregistrations')
    .select('*')
    .eq('resident_user_id', user.id)
    .order('expected_date', { ascending: true })
    .order('expected_time', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching visitor pre-registrations:', error);
    return {
      preregistrations: [] as VisitorPreregistration[],
      error: 'Failed to load pre-registrations.',
    };
  }

  return {
    preregistrations: preregistrations as VisitorPreregistration[],
    error: null,
  };
};

export const actions: Actions = {
  cancelRegistration: async ({ request, locals: { supabase, session, user } }) => {
    if (!session || !user) {
      return fail(401, { success: false, message: 'User not authenticated.' });
    }

    const formData = await request.formData();
    const preregistrationId = formData.get('preregistration_id') as string;

    if (!preregistrationId) {
      return fail(400, { success: false, message: 'Missing pre-registration ID.' });
    }

    // Optional: Explicit check if the registration belongs to the user and is pending
    // RLS policies should enforce this, but an additional check can provide clearer error feedback.
    const { data: existingReg, error: fetchError } = await supabase
      .from('visitor_preregistrations')
      .select('id, resident_user_id, status')
      .eq('id', preregistrationId)
      .eq('resident_user_id', user.id) // Ensure it belongs to the user
      .single();

    if (fetchError || !existingReg) {
      return fail(404, { success: false, message: 'Registration not found or access denied.' });
    }

    if (existingReg.status !== 'pending') {
      return fail(400, {
        success: false,
        message: `Cannot cancel registration with status: ${existingReg.status}.`,
        preregistrationId, // For UI to potentially highlight the row
      });
    }

    const { error: updateError } = await supabase
      .from('visitor_preregistrations')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', preregistrationId)
      .eq('resident_user_id', user.id); // RLS also handles this, but good for explicitness

    if (updateError) {
      console.error('Error cancelling registration:', updateError);
      return fail(500, {
        success: false,
        message: `Failed to cancel registration: ${updateError.message}`,
        preregistrationId,
      });
    }

    // No need to return data, load function will re-fetch.
    // SvelteKit's default behavior on form action success is to invalidate page data and re-run load.
    return { success: true, message: 'Registration cancelled successfully.', cancelledId: preregistrationId };
  },
};
