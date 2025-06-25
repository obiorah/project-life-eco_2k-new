/*
      # Add balance column to profiles table

      1. Modified Tables
        - `profiles`
          - Added `balance` (numeric, default 0)
      2. Important Notes
        - This migration adds a new `balance` column to the `profiles` table with a default value of 0.
        - Existing rows will have a `balance` of 0.
    */

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'balance'
      ) THEN
        ALTER TABLE profiles ADD COLUMN balance numeric DEFAULT 0;
      END IF;
    END $$;