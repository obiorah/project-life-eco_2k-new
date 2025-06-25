/*
      # Fix Profiles RLS Column Name

      1. Security
        - Drop the existing RLS policy "Allow authenticated users to read their own profile" (or the previous problematic one).
        - Create a new RLS policy "Allow authenticated users to read their own profile" that correctly uses `auth.uid() = id`.
    */

    -- Drop the previously created policy that used the incorrect column name
    DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.profiles;

    -- Drop the original policy if it still exists and was not dropped by the previous attempt
    DROP POLICY IF EXISTS "Enable users to view their own data only" ON public.profiles;

    -- Ensure RLS is enabled on the profiles table
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Create a new policy to allow authenticated users to select their own profile
    -- This policy directly compares auth.uid() with the 'id' column, which is the common convention.
    CREATE POLICY "Allow authenticated users to read their own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
