/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users.id)
      - `date` (timestamp with time zone, default now())
      - `type` (text, e.g., 'Minting', 'Transfer', 'Purchase', 'Reward', 'Adjustment')
      - `narration` (text)
      - `debit` (numeric, nullable)
      - `credit` (numeric, nullable)
      - `balance` (numeric, not null)
  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to read their own transactions
    - Add policy for authenticated users to insert their own transactions
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date timestamptz DEFAULT now(),
  type text NOT NULL,
  narration text,
  debit numeric,
  credit numeric,
  balance numeric NOT NULL
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