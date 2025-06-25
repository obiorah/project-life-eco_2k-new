import { supabase, supabaseAdmin } from "~/lib/supabase";
import type { UserProfile } from "~/types/user";

// Get user profile by ID
export async function getUserById(userId: string) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return profile as UserProfile;
}

// Get user by email
export async function getUserByEmail(email: string) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }

  return profile as UserProfile;
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return profile as UserProfile;
}

// Create new user profile (to be called after auth user is created)
export async function createUserProfile(
  userId: string,
  profileData: {
    email: string;
    full_name: string;
    group_id?: string | null;
    role?: string;
  }
) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      email: profileData.email,
      full_name: profileData.full_name,
      group_id: profileData.group_id || null,
      role: profileData.role || 'User',
      status: 'Active',
      balance: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    throw new Error(`Profile creation failed: ${error.message}`);
  }

  return profile as UserProfile;
}

// Verify user exists in profiles table
export async function verifyUserExists(userId: string) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('User verification failed:', error);
    return false;
  }

  return true;
}

// Get all users (for admin)
export async function getAllUsers() {
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all users:', error);
    return [];
  }

  return profiles as UserProfile[];
}

// Search users (for admin)
export async function searchUsers(query: string) {
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return profiles as UserProfile[];
}

// Update user balance
export async function updateUserBalance(
  userId: string,
  amount: number,
  transactionType: 'credit' | 'debit'
) {
  const operator = transactionType === 'credit' ? '+' : '-';
  
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .update({
      balance: supabaseAdmin.rpc(`balance ${operator} ${amount}`)
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user balance:', error);
    return null;
  }

  return profile as UserProfile;
}

// Helper function to ensure profile exists
export async function ensureProfileExists(userId: string, email: string) {
  const exists = await verifyUserExists(userId);
  if (!exists) {
    return await createUserProfile(userId, {
      email,
      full_name: email.split('@')[0], // Default name
    });
  }
  return await getUserById(userId);
}