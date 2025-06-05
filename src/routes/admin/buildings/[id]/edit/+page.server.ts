import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Building } from '$lib/types/database';

// Schema for validating form data (same as new, but all fields might be relevant for update)
const buildingSchema = z.object({
  name: z.string().min(1, { message: "Building name is required." }).max(255),
  address: z.string().max(500).optional().nullable(),
  number_of_floors: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().positive().optional().nullable()
  ),
});

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
  if (!user || user.app_metadata?.role !== 'admin') {
    throw redirect(303, '/unauthorized');
  }

  const buildingId = params.id;
  const { data: building, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', buildingId)
    .single();

  if (error || !building) {
    console.error('Error fetching building for edit:', error);
    throw redirect(303, '/admin/buildings?error=notfound'); // Or show a 404 page
  }

  return { building: building as Building };
};

export const actions: Actions = {
  updateBuilding: async ({ request, params, locals: { supabase, user } }) => {
    if (!user || user.app_metadata?.role !== 'admin') {
      return fail(403, { message: 'Unauthorized' });
    }

    const buildingId = params.id;
    if (!buildingId) {
      return fail(400, { message: 'Building ID is missing.' });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const address = formData.get('address') as string | null;
    const numberOfFloors = formData.get('numberOfFloors') as string | null;

    const parsedFloors = numberOfFloors === null || numberOfFloors.trim() === '' ? null : Number(numberOfFloors);

    const validationResult = buildingSchema.safeParse({
      name,
      address,
      number_of_floors: parsedFloors,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      // Return form values to repopulate the form correctly
      return fail(400, {
        id: buildingId, // Keep id for form context
        name,
        address,
        numberOfFloors: parsedFloors, // use parsed value for consistency
        errors,
      });
    }

    const { data: validatedData } = validationResult;

    // Construct data for Supabase, only including fields that are actually provided
    // Supabase client typically handles undefined fields by not updating them, but being explicit is fine.
    const buildingDataToUpdate: { name: string; address?: string | null; number_of_floors?: number | null } = {
        name: validatedData.name,
        address: validatedData.address, // Will be null if empty or not provided and schema allows
        number_of_floors: validatedData.number_of_floors // Will be null if empty or not provided and schema allows
    };


    const { error } = await supabase
      .from('buildings')
      .update(buildingDataToUpdate)
      .eq('id', buildingId);

    if (error) {
      console.error('Error updating building:', error);
      return fail(500, {
        id: buildingId,
        name: validatedData.name,
        address: validatedData.address,
        numberOfFloors: validatedData.number_of_floors,
        message: `Failed to update building: ${error.message}`,
        errors: null, // Ensure errors object isn't misconstrued
      });
    }

    throw redirect(303, '/admin/buildings');
  },
};
