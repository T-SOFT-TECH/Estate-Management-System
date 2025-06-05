import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Building } from '$lib/types/database';

// Schema for validating unit form data
const unitSchema = z.object({
  unit_number: z.string().min(1, { message: "Unit number is required." }).max(50),
  size: z.string().max(100).optional().nullable(),
  layout_type: z.string().max(100).optional().nullable(), // e.g., "2BHK", "Studio"
  ownership_status: z.string().max(100).optional().nullable(), // e.g., "Owned", "Rented"
});

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
  if (!user || user.app_metadata?.role !== 'admin') {
    throw redirect(303, '/unauthorized');
  }

  const buildingId = params.id;
  if (!buildingId) {
    throw redirect(303, '/admin/buildings?error=nobuildingid');
  }

  const { data: building, error } = await supabase
    .from('buildings')
    .select('id, name') // Only fetch what's needed
    .eq('id', buildingId)
    .single();

  if (error || !building) {
    console.error('Error fetching parent building for new unit page:', error);
    // Redirect to admin buildings list if parent building not found
    throw redirect(303, '/admin/buildings?error=buildingnotfound');
  }

  return { building: building as Pick<Building, 'id' | 'name'> };
};

export const actions: Actions = {
  default: async ({ request, params, locals: { supabase, user } }) => {
    if (!user || user.app_metadata?.role !== 'admin') {
      return fail(403, { message: 'Unauthorized' });
    }

    const buildingId = params.id;
    if (!buildingId) {
      return fail(400, { message: 'Building ID is missing for unit creation.' });
    }

    const formData = await request.formData();
    const unitData = {
      unit_number: formData.get('unit_number') as string,
      size: formData.get('size') as string | null,
      layout_type: formData.get('layout_type') as string | null,
      ownership_status: formData.get('ownership_status') as string | null,
    };

    const validationResult = unitSchema.safeParse(unitData);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return fail(400, {
        ...unitData, // Return submitted data to repopulate form
        errors,
      });
    }

    const { data: validatedData } = validationResult;

    const unitDataToInsert = {
      ...validatedData,
      building_id: buildingId,
    };

    const { error: insertError } = await supabase.from('units').insert([unitDataToInsert]);

    if (insertError) {
      console.error('Error creating unit:', insertError);
      return fail(500, {
        ...validatedData,
        message: `Failed to create unit: ${insertError.message} (Code: ${insertError.code})`,
        // Check for unique constraint violation (code 23505 for PostgreSQL)
        isUniqueConstraintError: insertError.code === '23505',
      });
    }

    // On success, redirect to the public view of the parent building
    throw redirect(303, `/buildings/${buildingId}`);
  },
};
