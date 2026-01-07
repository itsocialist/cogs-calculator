/**
 * Supabase Client Configuration
 * 
 * Provides the Supabase client for cloud sync.
 * Falls back gracefully if environment variables are not set.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Environment variables (set in .env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client only if both URL and key are available
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false, // We use password gate, not Supabase auth
        },
    });
}

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseAvailable(): boolean {
    return supabase !== null;
}

/**
 * Get the Supabase client (may be null if not configured)
 */
export function getSupabase(): SupabaseClient | null {
    return supabase;
}

// Export for direct use
export { supabase };
