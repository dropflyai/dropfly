-- ============================================
-- QUICK FIX: Copy and paste this entire script
-- into Supabase Dashboard > SQL Editor > New Query
-- Then click RUN
-- ============================================

-- Step 1: Add daily tracking columns
ALTER TABLE public.token_balances
ADD COLUMN IF NOT EXISTS daily_spent INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.token_balances
ADD COLUMN IF NOT EXISTS daily_limit INTEGER NOT NULL DEFAULT 15;

ALTER TABLE public.token_balances
ADD COLUMN IF NOT EXISTS last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Step 2: Fix RLS policies for token_balances
DROP POLICY IF EXISTS "Service role can manage token balances" ON public.token_balances;
CREATE POLICY "Service role can manage token balances"
  ON public.token_balances
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 3: Fix RLS policies for token_transactions
DROP POLICY IF EXISTS "Users can view own token transactions" ON public.token_transactions;
CREATE POLICY "Users can view own token transactions"
  ON public.token_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert token transactions" ON public.token_transactions;
CREATE POLICY "Service role can insert token transactions"
  ON public.token_transactions
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update token transactions" ON public.token_transactions;
CREATE POLICY "Service role can update token transactions"
  ON public.token_transactions
  FOR UPDATE
  USING (true);

-- Confirm success
SELECT 'All fixes applied successfully!' AS message;
