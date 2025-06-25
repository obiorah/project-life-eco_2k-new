/*
      # Fix Profiles RLS Policy

      This migration ensures the `profiles` table has the correct Row Level Security (RLS) policy
      to prevent "infinite recursion" errors and allow users to read only their own profile data.

      1. Security
        - Disables RLS on `profiles` table temporarily.
        - Drops all existing RLS policies on `profiles` to ensure a clean state.
        - Enables RLS on `profiles` table.
        - Adds a `SELECT` policy named "Allow authenticated users to read their own profile"
          which permits authenticated users to retrieve their own profile record where `auth.uid()` matches the `id` column of the `profiles` table.
    */

    -- Disable RLS temporarily to drop existing policies
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

    -- Drop all existing policies on the profiles table to ensure a clean slate
    DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can read own data" ON public.profiles;
    -- Add more DROP POLICY statements here if you have other policies on 'profiles'

    -- Enable RLS on the profiles table
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Create a policy that allows authenticated users to read their own profile
    CREATE POLICY "Allow authenticated users to read their own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
