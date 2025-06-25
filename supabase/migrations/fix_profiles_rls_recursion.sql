/*
      # Fix Profiles RLS Recursion

      1. Security
        - Drop the existing RLS policy "Enable users to view their own data only" which causes recursion.
        - Create a new RLS policy "Allow authenticated users to read their own profile" that correctly uses `auth.uid()` without a subquery.
    */

    -- Drop the existing policy that causes recursion
    DROP POLICY IF EXISTS "Enable users to view their own data only" ON public.profiles;

    -- Create a new policy to allow authenticated users to select their own profile
    -- This policy directly compares auth.uid() with the user_id column, avoiding recursion.
    CREATE POLICY "Allow authenticated users to read their own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
