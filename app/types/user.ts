export interface UserProfile {
  id: string; // Corresponds to Supabase Auth user ID and public.profiles.id
  email?: string; // Typically from Supabase Auth, can be synced to profiles
  full_name?: string; // From public.profiles
  balance?: number; // From public.profiles
  role?: string; // From public.profiles
  created_at?: string; // From public.profiles or Supabase Auth
  // Add other profile-specific fields as needed
  // For Zustand store, we might also need:
  status?: string; // e.g., 'active', 'suspended'
  // groupId?: string; // Removed as per schema review, profiles.id links to auth.users.id
  // groupName?: string; // Removed, not directly on profiles table
  // avatarUrl?: string; // Removed, not directly on profiles table
  // The following are from the latest SQL for profiles table
  display_name?: string; // Added from initial profiles DDL
  bio?: string; // Added from initial profiles DDL
  user_id?: string; // This is the redundant UUID from initial DDL, RLS might use it
  group_id?: string; // This was added in ALTER TABLE, might be null
  // groupName and avatarUrl are not in the provided profiles SQL.
  // If they come from a joined 'groups' table or elsewhere, the type needs to reflect that.
  // For now, assuming they are not part of the core UserProfile fetched directly from 'profiles'
  groupName?: string; // This would typically come from a join with a 'groups' table
  avatarUrl?: string; // This might also come from 'profiles' if a column is added, or elsewhere
}
