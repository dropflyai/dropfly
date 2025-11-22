-- Fix RLS policies for token_balances and token_transactions
-- The token service needs to be able to INSERT/UPDATE from server-side API routes

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
-- This allows server-side API routes to record transactions
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

SELECT 'Token RLS policies fixed successfully!' as message;
