/*
  # Recreate transactions table

  1. Changes
    - Drops the existing `transactions` table to ensure a clean recreation.
    - Recreates the `transactions` table with `user_id` referencing `auth.users(id)`.
    - Re-applies RLS policies for authenticated users to read and insert their own transactions.
    - Ensures `created_at` is used for timestamps and `balance_after` for balance.
  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to read their own transactions
    - Add policy for authenticated users to insert their own transactions
*/

DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  type text NOT NULL,
  narration text,
  debit numeric,
  credit numeric,
  balance_after numeric NOT NULL
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

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