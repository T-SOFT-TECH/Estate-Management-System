import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod'; // For validation

// Schema for validating form data
const buildingSchema = z.object({
  name: z.string().min(1, { message: "Building name is required." }).max(255),
  address: z.string().max(500).optional().nullable(),
  number_of_floors: z.preprocess(
    // Preprocess to convert empty string or non-number to undefined, then coerce to number
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().positive().optional().nullable()
  ),
});

// Load function to ensure user is admin (though hook should also cover this)
export const load: PageServerLoad = async ({ locals: { user } }) => {
  if (!user || user.app_metadata?.role !== 'admin') {
    throw redirect(303, '/unauthorized');
  }
  return {}; // Return empty object as no specific data needs to be loaded for the form itself
};

export const actions: Actions = {
  createBuilding: async ({ request, locals: { supabase, user } }) => {
    if (!user || user.app_metadata?.role !== 'admin') {
      return fail(403, { message: 'Unauthorized' });
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
      return fail(400, {
        name,
        address,
        numberOfFloors,
        errors,
      });
    }

    const { data: validatedData } = validationResult;

    const buildingDataToInsert: { name: string; address?: string | null; number_of_floors?: number | null } = {
        name: validatedData.name,
    };
    if (validatedData.address !== undefined) buildingDataToInsert.address = validatedData.address;
    if (validatedData.number_of_floors !== undefined) buildingDataToInsert.number_of_floors = validatedData.number_of_floors;


    const { error } = await supabase.from('buildings').insert([buildingDataToInsert]);

    if (error) {
      console.error('Error creating building:', error);
      return fail(500, {
        name: validatedData.name,
        address: validatedData.address,
        numberOfFloors: validatedData.number_of_floors,
        message: `Failed to create building: ${error.message}`,
      });
    }

    // On success, redirect to the admin buildings list
    throw redirect(303, '/admin/buildings');
  },
};
