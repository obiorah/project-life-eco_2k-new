// app/lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js';

console.log('[supabase-admin] Initializing Supabase admin client module...');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Enhanced logging for diagnostics
console.log(`[supabase-admin] Environment SUPABASE_URL check: ${supabaseUrl ? `SET (starts with: ${supabaseUrl.substring(0, Math.min(30, supabaseUrl.length))}...)` : 'NOT SET'}`);
console.log(`[supabase-admin] Environment SUPABASE_SERVICE_ROLE_KEY check: ${serviceRoleKey ? 'SET (sensitive, not logged)' : 'NOT SET'}`);

if (!supabaseUrl || !serviceRoleKey) {
  const errorMessage = "[supabase-admin] CRITICAL ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing or empty. These are required for admin-level Supabase operations. Please check your .env file and server environment configuration.";
  console.error(errorMessage);
  // Throw an error to prevent the application from attempting to use an uninitialized client.
  // This will make the startup failure more apparent if env vars are missing.
  throw new Error(errorMessage);
}

let supabaseAdminClientInstance;

try {
  console.log('[supabase-admin] Attempting to create Supabase admin client instance...');
  supabaseAdminClientInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // For server-side clients using a service role key, it's good practice:
      autoRefreshToken: false, // No need to refresh a service key
      persistSession: false,   // No session to persist
      detectSessionInUrl: false // Not applicable for server-side
    }
  });
  console.log('[supabase-admin] Supabase admin client instance created.');

  // Verify that the created client looks like a Supabase client
  if (!supabaseAdminClientInstance || typeof supabaseAdminClientInstance.from !== 'function') {
    const clientVerificationError = '[supabase-admin] CRITICAL ERROR: Supabase admin client instance was created, but it does not appear to be a valid Supabase client (e.g., ".from" method is missing).';
    console.error(clientVerificationError);
    throw new Error(clientVerificationError);
  }
  console.log('[supabase-admin] Supabase admin client instance verified successfully (basic check).');

} catch (error: any) {
  console.error('[supabase-admin] CRITICAL ERROR: Failed to create or verify the Supabase admin client instance.', error.message);
  // Re-throw the error to ensure the application is aware of this critical failure.
  throw error;
}

// Final check before exporting
if (!supabaseAdminClientInstance) {
    const finalCheckError = '[supabase-admin] CRITICAL ERROR: supabaseAdminClientInstance is unexpectedly null or undefined before export. This should not happen if previous checks passed.';
    console.error(finalCheckError);
    throw new Error(finalCheckError);
}

// Export the initialized client
// The original code used `export default supabaseAdmin;`
// We'll stick to that pattern.
const supabaseAdmin = supabaseAdminClientInstance;
export default supabaseAdmin;
