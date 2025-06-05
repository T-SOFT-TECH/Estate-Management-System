// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
// import type { Database } from './lib/types/database'; // Assuming you might have this for typed Supabase client
// If you don't have a DB generated types file, you can use a more generic SupabaseClient type
// SupabaseClient<any, "public"> or just SupabaseClient

declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
			// code?: string // If you want to add specific error codes
		}
		interface Locals {
			supabase: SupabaseClient; // Using a generic client type if DB types are not set up for client yet
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
		}
		interface PageData {
			session?: Session | null; // Make session optional in PageData as not all pages might expose it
			// You can add other page-specific data types here
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
