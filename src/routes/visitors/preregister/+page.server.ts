import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

// Zod schema for validating pre-registration form data
const preregistrationSchema = z.object({
  visitor_name: z.string().min(1, { message: "Visitor's name is required." }).max(255),
  expected_date: z.string().min(1, { message: "Expected date is required." })
    .refine(date => new Date(date) >= new Date(new Date().setHours(0,0,0,0)), {
      message: "Expected date must be today or a future date."
    }),
  expected_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format. Use HH:MM." }).optional().nullable().or(z.literal('')), // HH:MM format or empty
  vehicle_plate: z.string().max(50).optional().nullable(),
});

export const load: PageServerLoad = async ({ locals: { session, user } }) => {
  // User must be authenticated to pre-register a visitor
  if (!session || !user) {
    throw redirect(303, '/login?redirect=/visitors/preregister');
  }
  // No specific data needs to be loaded for the form itself,
  // but returning session/user can be useful for the page if needed.
  return {
    // session, // Already available via $page.data.session from root layout
    // user,    // Already available via $page.data.user from root layout
  };
};

export const actions: Actions = {
  default: async ({ request, locals: { supabase, session, user } }) => { // user is from safeGetSession via hooks
    if (!session || !user) {
      return fail(401, { message: 'User not authenticated. Please log in.' });
    }

    const formData = await request.formData();
    const dataToValidate = {
      visitor_name: formData.get('visitor_name') as string,
      expected_date: formData.get('expected_date') as string,
      expected_time: formData.get('expected_time') as string | null,
      vehicle_plate: formData.get('vehicle_plate') as string | null,
    };

    // Handle empty string for optional time
    if (dataToValidate.expected_time === '') {
        dataToValidate.expected_time = null;
    }

    const validationResult = preregistrationSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return fail(400, {
        ...dataToValidate, // Return submitted data to repopulate form
        errors,
      });
    }

    const { data: validatedData } = validationResult;

    const preregistrationData = {
      resident_user_id: user.id,
      visitor_name: validatedData.visitor_name,
      expected_date: validatedData.expected_date,
      expected_time: validatedData.expected_time || null, // Ensure null if empty/undefined
      vehicle_plate: validatedData.vehicle_plate || null, // Ensure null if empty/undefined
      status: 'pending', // Default status
    };

    const { error: insertError } = await supabase
      .from('visitor_preregistrations')
      .insert([preregistrationData]);

    if (insertError) {
      console.error('Error pre-registering visitor:', insertError);
      return fail(500, {
        ...validatedData, // Keep validated data to repopulate form
        message: `Failed to pre-register visitor: ${insertError.message}`,
      });
    }

    // On success, redirect to a page where users can see their pre-registrations
    // For now, redirecting to a generic /visitors page (to be created)
    throw redirect(303, '/visitors?preregistered=true');
  },
};
