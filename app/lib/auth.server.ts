import { createClient } from "@supabase/supabase-js";
import { redirect } from "@remix-run/node";
import { getSession, commitSession, destroySession } from "~/lib/session.server";
import type { UserProfile } from "~/types/user";


// This function creates a Supabase client that can handle session cookies
// on the server-side within Remix loaders/actions.
export function getSupabaseWithSessionAndHeaders(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Remix handles session persistence
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // Intercept Supabase requests to add/update session cookies
  supabase.auth.onAuthStateChange(async (event, session) => {
    const existingSession = await getSession(request.headers.get("Cookie"));
    if (session) {
      existingSession.set("supabase:session", session);
    } else {
      existingSession.unset("supabase:session");
    }
  });

  return { supabase, headers: new Headers() };
}

export async function signIn(request: Request, { email, password }: { email: string; password: string }) {
  const { supabase, headers } = getSupabaseWithSessionAndHeaders(request);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Supabase signIn error:", error);
    return { error: error.message, headers };
  }

  if (data.session) {
    const session = await getSession(request.headers.get("Cookie"));
    session.set("supabase:session", data.session);
    headers.append("Set-Cookie", await commitSession(session));
  }

  return { data, headers };
}

export async function signOut(request: Request) {
  const { supabase, headers } = getSupabaseWithSessionAndHeaders(request);
  const session = await getSession(request.headers.get("Cookie"));

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase signOut error:", error);
    // Even if signOut fails on Supabase, we should still clear our local session
  }

  headers.append("Set-Cookie", await destroySession(session));
  return redirect("/login", { headers });
}

export async function getAuthSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const supabaseSession = session.get("supabase:session");

  if (!supabaseSession) {
    return null;
  }

  // You might want to verify the session with Supabase here if needed,
  // but for basic checks, the presence of the session in the cookie is enough.
  return supabaseSession;
}

export async function requireUserId(request: Request): Promise<string> {
  const session = await getAuthSession(request);
  
  if (!session || !session.user) {
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(await getSession(request.headers.get("Cookie")))
      }
    });
  }

  return session.user.id;
}

export async function getUserProfile(request: Request): Promise<{ userProfile: UserProfile | null; headers: Headers }> {
  const { supabase, headers } = getSupabaseWithSessionAndHeaders(request);
  const session = await getAuthSession(request);

  if (!session || !session.user) {
    return { userProfile: null, headers };
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, balance, role, created_at, group_id')
    .eq('id', session.user.id)
    .single();

  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    // If profile not found or error, destroy session and redirect to login
    headers.append("Set-Cookie", await destroySession(await getSession(request.headers.get("Cookie"))));
    throw redirect("/login", { headers });
  }

  return { userProfile: profileData as UserProfile, headers };
}
