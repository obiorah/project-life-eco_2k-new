/*
      # Fix Profiles RLS Policy

      1. Security
        - Ensure RLS is enabled on the `profiles` table.
        - Add or update a RLS policy to allow authenticated users to select their own profile.
    */

    -- Enable RLS on the profiles table if not already enabled
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies that might cause recursion (if any, this is a safe way to reset)
    DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can read own data" ON profiles; -- Common alternative name

    -- Create a new policy to allow authenticated users to select their own profile
    CREATE POLICY "Allow authenticated users to read their own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
