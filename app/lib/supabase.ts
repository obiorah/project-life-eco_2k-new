import { createClient } from '@supabase/supabase-js';
// Assuming you might generate types later, keep this import commented or adjust as needed
// import type { Database } from '~/types/supabase';

// Server-side environment variables
const serverSupabaseUrl = process.env.SUPABASE_URL;
const serverSupabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Client-side environment variables (accessed via window.ENV)
// Ensure window.ENV exists before accessing its properties
const clientSupabaseUrl = typeof window !== 'undefined' && window.ENV ? window.ENV.SUPABASE_URL : undefined;
const clientSupabaseAnonKey = typeof window !== 'undefined' && window.ENV ? window.ENV.SUPABASE_ANON_KEY : undefined;

// Determine Supabase URL and Key based on environment (server or client)
const supabaseUrl = typeof document === 'undefined' ? serverSupabaseUrl : clientSupabaseUrl;
const supabaseAnonKey = typeof document === 'undefined' ? serverSupabaseAnonKey : clientSupabaseAnonKey;

// Refined check: Throw error only on server if vars are missing during initialization
if (typeof document === 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    // This error will stop the server if env vars are not loaded correctly
    throw new Error('[supabase.ts Server Init] Supabase URL and Anon Key must be provided in server environment variables.');
  }
} else {
  // Client-side warning if ENV isn't immediately available (might happen before root loader script runs)
  if (!supabaseUrl || !supabaseAnonKey) {
     console.warn('[supabase.ts Client Init] Supabase URL/Key not immediately available. Ensure ENV is loaded via root loader script.');
  }
}


// Create and export the Supabase client (for ANON operations)
// Use Database generic if you have generated types: createClient<Database>(...)
// Initialize with potentially undefined values on client, relying on ENV script
// Add a check to ensure we don't pass undefined to createClient, especially on the server
if (!supabaseUrl || !supabaseAnonKey) {
  // This condition should ideally only be met temporarily on the client before ENV loads.
  // If it happens on the server, the error above should have caught it.
  console.error("[supabase.ts] CRITICAL: Attempting to initialize Supabase client with missing URL or Key. This should not happen on the server.");
  // Avoid creating a client that will definitely fail. You might return a dummy object
  // or handle this case based on your app's needs, but throwing might be safer.
  // For now, let it proceed but log the error. The subsequent Supabase calls will likely fail.
}
// Ensure we pass strings, even if they were potentially undefined earlier (though checks should prevent this on server)
// Add RLS policies for profiles table access
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      // Ensure we're using the correct table
      headers: { 'Prefer': 'resolution=merge-duplicates' }
    }
  }
);

// Helper function to get ONLY the necessary client-side environment variables
// This is called ONLY in the root loader on the server.
export function getBrowserEnvironment() {
  // Ensure this runs server-side and reads from process.env
  if (typeof window !== 'undefined') {
     console.error("getBrowserEnvironment should only be called on the server!");
     return {}; // Or handle appropriately
  }
  return {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    // Add other client-safe environment variables here if needed
  };
}

// Declare the ENV type on the window object for TypeScript
// Ensure this matches the structure returned by getBrowserEnvironment
declare global {
  interface Window {
    ENV: {
      SUPABASE_URL?: string; // Make optional as it might not be set immediately
      SUPABASE_ANON_KEY?: string; // Make optional
    };
  }
}

// Initialize window.ENV if it doesn't exist (client-side safety)
if (typeof window !== 'undefined' && typeof window.ENV === 'undefined') {
  window.ENV = {};
}
