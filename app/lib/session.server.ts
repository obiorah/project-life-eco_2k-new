import { createCookieSessionStorage } from "@remix-run/node";
import { createClient } from '@supabase/supabase-js';

// This is a temporary secret for development.
// In a production environment, you should use a strong, randomly generated secret
// stored securely (e.g., in environment variables).
const sessionSecret = process.env.SESSION_SECRET || "super-secret-dev-key";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

// Add RLS policies for profiles table access
const supabase = createClient(
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

// Updated function to verify session user exists
async function verifySessionUser(userId: string) {
  // Changed from 'users' to 'profiles'
  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .select('id, status')
    .eq('id', userId)
    .single();

  if (error || !user) {
    console.error('Session user verification failed:', error);
    return false;
  }

  return user.status === 'Active';
}