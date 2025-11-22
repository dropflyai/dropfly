-- CRITICAL FIX: Token System Database
-- Combines migrations 003 and 004

-- ============================================
-- PART 1: Add daily tracking columns
-- ============================================

-- Add daily_spent column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'token_balances'
    AND column_name = 'daily_spent'
  ) THEN
    ALTER TABLE public.token_balances
    ADD COLUMN daily_spent INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add daily_limit column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'token_balances'
    AND column_name = 'daily_limit'
  ) THEN
    ALTER TABLE public.token_balances
    ADD COLUMN daily_limit INTEGER NOT NULL DEFAULT 15;
  END IF;
END $$;

-- Add last_reset_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'token_balances'
    AND column_name = 'last_reset_date'
  ) THEN
    ALTER TABLE public.token_balances
    ADD COLUMN last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Create or replace the daily reset function
CREATE OR REPLACE FUNCTION reset_daily_token_spend()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.token_balances
  SET
    daily_spent = 0,
    last_reset_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE last_reset_date < CURRENT_DATE;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION reset_daily_token_spend() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_daily_token_spend() TO service_role;

-- ============================================
-- PART 2: Fix RLS policies
-- ============================================

-- Token Balances: Allow service role to manage balances
DROP POLICY IF EXISTS "Service role can manage token balances" ON public.token_balances;
CREATE POLICY "Service role can manage token balances"
  ON public.token_balances
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Token Transactions: Users can view their own transactions
DROP POLICY IF EXISTS "Users can view own token transactions" ON public.token_transactions;
CREATE POLICY "Users can view own token transactions"
  ON public.token_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Token Transactions: Service role can insert transactions
DROP POLICY IF EXISTS "Service role can insert token transactions" ON public.token_transactions;
CREATE POLICY "Service role can insert token transactions"
  ON public.token_transactions
  FOR INSERT
  WITH CHECK (true);

-- Token Transactions: Service role can update transactions (for refunds)
DROP POLICY IF EXISTS "Service role can update token transactions" ON public.token_transactions;
CREATE POLICY "Service role can update token transactions"
  ON public.token_transactions
  FOR UPDATE
  USING (true);

SELECT 'Token system fixes applied successfully!' as message;
