/*
      # Recreate Profiles RLS with Role-Based Access

      This migration addresses the "infinite recursion" error in RLS policies by introducing
      a `SECURITY DEFINER` function to safely retrieve the current user's role and suspended status.
      It then re-establishes all existing RLS policies using this function.

      1. Security
        - Disables RLS on `profiles` table.
        - Drops all previous RLS policies on `profiles`.
        - Creates a `get_current_user_status()` function (SECURITY DEFINER) to bypass RLS for role/status checks.
        - Enables RLS on `profiles` table.
        - Re-creates `SELECT`, `UPDATE`, `INSERT`, and `DELETE` policies for `profiles`,
          incorporating role and `is_suspended` checks using the new function.
    */

    -- Disable RLS temporarily to drop existing policies
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

    -- Drop all existing policies on the profiles table to ensure a clean slate
    DROP POLICY IF EXISTS "Users can read their own profile unless suspended" ON public.profiles;
    DROP POLICY IF EXISTS "Admins and Super Admins can read all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile unless suspended" ON public.profiles;
    DROP POLICY IF EXISTS "Admins and Super Admins can update all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Super Admins can insert any profile" ON public.profiles;
    DROP POLICY IF EXISTS "Super Admins can delete any profile" ON public.profiles;
    -- Also drop policies from previous attempts if they exist
    DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can read own data" ON public.profiles;

    -- Drop the security definer function if it exists for idempotency
    DROP FUNCTION IF EXISTS public.get_current_user_status();

    -- Create a SECURITY DEFINER function to get the current user's role and suspended status
    -- This function runs with elevated privileges and bypasses RLS on 'profiles'
    CREATE OR REPLACE FUNCTION public.get_current_user_status()
    RETURNS TABLE (user_id uuid, user_role text, is_suspended boolean)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT id, role, is_suspended
      FROM public.profiles
      WHERE id = auth.uid();
    END;
    $$;

    -- Grant execution to authenticated users
    GRANT EXECUTE ON FUNCTION public.get_current_user_status() TO authenticated;

    -- Enable RLS on the profiles table
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Re-create policies using the new security definer function

    -- Policy 1: Users can read their own profile unless suspended
    CREATE POLICY "Users can read their own profile unless suspended"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = id AND NOT is_suspended
      );

    -- Policy 2: Admins and Super Admins can read all profiles
    CREATE POLICY "Admins and Super Admins can read all profiles"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (
        (SELECT user_role FROM public.get_current_user_status() WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
        AND NOT (SELECT is_suspended FROM public.get_current_user_status() WHERE user_id = auth.uid())
      );

    -- Policy 3: Users can update their own profile unless suspended
    CREATE POLICY "Users can update their own profile unless suspended"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = id AND NOT is_suspended
      );

    -- Policy 4: Admins and Super Admins can update all profiles
    CREATE POLICY "Admins and Super Admins can update all profiles"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (
        (SELECT user_role FROM public.get_current_user_status() WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
        AND NOT (SELECT is_suspended FROM public.get_current_user_status() WHERE user_id = auth.uid())
      );

    -- Policy 5: Super Admins can insert any profile
    CREATE POLICY "Super Admins can insert any profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (
        (SELECT user_role FROM public.get_current_user_status() WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
        AND NOT (SELECT is_suspended FROM public.get_current_user_status() WHERE user_id = auth.uid())
      );

    -- Policy 6: Super Admins can delete any profile
    CREATE POLICY "Super Admins can delete any profile"
      ON public.profiles
      FOR DELETE
      TO authenticated
      USING (
        (SELECT user_role FROM public.get_current_user_status() WHERE user_id = auth.uid()) IN ('super_admin')
        AND NOT (SELECT is_suspended FROM public.get_current_user_status() WHERE user_id = auth.uid())
      );
