/*
  # Reconfirm transactions table RLS policies

  1. Changes
    - Re-applies the `transactions` table RLS policies to ensure they are correctly set.
    - Confirms `user_id` references `public.profiles(id)`.
    - Explicitly defines `SELECT` and `INSERT` policies using `auth.uid() = user_id`.
  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to read their own transactions
    - Add policy for authenticated users to insert their own transactions
*/

-- Ensure RLS is enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts during re-application
DROP POLICY IF EXISTS "Authenticated users can read their own transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can insert their own transactions" ON transactions;

-- Policy for authenticated users to read their own transactions
CREATE POLICY "Authenticated users can read their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for authenticated users to insert their own transactions
CREATE POLICY "Authenticated users can insert their own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);