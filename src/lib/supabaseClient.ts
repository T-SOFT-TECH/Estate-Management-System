import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Log a message to confirm client initialization (for development)
// console.log('Supabase client initialized. URL:', supabaseUrl);

// You can also add a health check function if needed
/*
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('users').select('*').limit(1); // Try a simple query
    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    console.log('Supabase connection successful.');
    return true;
  } catch (e: any) {
    console.error('Exception during Supabase connection check:', e.message);
    return false;
  }
}
*/
