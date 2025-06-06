export interface Building {
  id: string; // UUID is a string in JS/TS
  name: string;
  address?: string | null;
  number_of_floors?: number | null;
  created_at: string; // TIMESTAMPTZ is a string, can be parsed to Date
}

export interface Unit {
  id: string; // UUID
  building_id: string; // UUID
  unit_number: string;
  size?: string | null;
  layout_type?: string | null;
  ownership_status?: string | null;
  created_at: string; // TIMESTAMPTZ
}

// It's also common to create a wrapper for your Supabase generated types
// if you use `supabase gen types typescript > ...`
// For now, manual types are fine.

/*
// Example of how you might integrate with Supabase generated types later:
import type { Database as DB } from './supabase-generated'; // Adjust path

export type Building = DB['public']['Tables']['buildings']['Row'];
export type Unit = DB['public']['Tables']['units']['Row'];
*/

export interface VisitorPreregistration {
  id: string; // UUID
  resident_user_id: string; // UUID of the user from auth.users
  visitor_name: string;
  expected_date: string; // Format: YYYY-MM-DD
  expected_time?: string | null; // Format: HH:MM or HH:MM:SS
  vehicle_plate?: string | null;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}
