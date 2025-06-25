/*
  # Refresh transactions table schema cache

  1. Changes
    - Add a comment to the `transactions` table to force Supabase to refresh its schema cache.
*/

COMMENT ON TABLE transactions IS 'Table to store all currency transactions. Comment added to force schema cache refresh.';