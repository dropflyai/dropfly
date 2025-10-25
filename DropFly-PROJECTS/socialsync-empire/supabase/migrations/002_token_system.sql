-- Token/Credit System Migration
-- This migration creates the token balance and transaction tracking system

-- Token Balances Table
CREATE TABLE IF NOT EXISTS public.token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Token Transactions Table
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for earn, negative for spend
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'refund', 'bonus', 'purchase')),
  reason TEXT NOT NULL,
  operation TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_token_balances_user_id ON public.token_balances(user_id);
CREATE INDEX idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX idx_token_transactions_created_at ON public.token_transactions(created_at DESC);
CREATE INDEX idx_token_transactions_operation ON public.token_transactions(operation);

-- RLS Policies
ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own token balance
CREATE POLICY "Users can view own token balance"
  ON public.token_balances
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only view their own transactions
CREATE POLICY "Users can view own token transactions"
  ON public.token_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Function to initialize token balance for new users
CREATE OR REPLACE FUNCTION public.initialize_token_balance()
RETURNS TRIGGER AS $$
DECLARE
  initial_tokens INTEGER;
BEGIN
  -- Get initial token allocation based on user's tier (default to free tier)
  initial_tokens := 300; -- Free tier default

  -- Insert initial token balance
  INSERT INTO public.token_balances (user_id, balance, lifetime_earned)
  VALUES (NEW.id, initial_tokens, initial_tokens);

  -- Log the initial token grant
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    type,
    reason,
    operation,
    balance_after,
    metadata
  ) VALUES (
    NEW.id,
    initial_tokens,
    'bonus',
    'Welcome bonus tokens',
    'bonus_tokens',
    initial_tokens,
    jsonb_build_object('signup_bonus', true)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize token balance for new users
DROP TRIGGER IF EXISTS on_auth_user_created_initialize_tokens ON auth.users;
CREATE TRIGGER on_auth_user_created_initialize_tokens
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_token_balance();

-- Function to update token balance timestamp
CREATE OR REPLACE FUNCTION public.update_token_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on token balance changes
DROP TRIGGER IF EXISTS update_token_balance_timestamp ON public.token_balances;
CREATE TRIGGER update_token_balance_timestamp
  BEFORE UPDATE ON public.token_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_token_balance_timestamp();

-- Function to handle monthly token allocations
CREATE OR REPLACE FUNCTION public.allocate_monthly_tokens()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
  monthly_allocation INTEGER;
  rollover_amount INTEGER;
  max_rollover INTEGER;
  new_balance INTEGER;
BEGIN
  -- Loop through all active subscription users
  FOR user_record IN
    SELECT
      u.id as user_id,
      COALESCE(p.subscription_tier, 'free') as tier,
      COALESCE(tb.balance, 0) as current_balance
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    LEFT JOIN public.token_balances tb ON u.id = tb.user_id
  LOOP
    -- Determine monthly allocation based on tier
    monthly_allocation := CASE user_record.tier
      WHEN 'free' THEN 300
      WHEN 'starter' THEN 1800
      WHEN 'creator' THEN 3600
      WHEN 'pro' THEN 6000
      WHEN 'agency' THEN 12000
      WHEN 'enterprise' THEN 20000
      ELSE 300
    END;

    -- Determine max rollover based on tier
    max_rollover := CASE user_record.tier
      WHEN 'free' THEN 0  -- No rollover for free
      WHEN 'starter' THEN 900
      WHEN 'creator' THEN 1800
      WHEN 'pro' THEN 3000
      WHEN 'agency' THEN 6000
      WHEN 'enterprise' THEN 10000
      ELSE 0
    END;

    -- Calculate rollover (unused tokens from previous month)
    rollover_amount := LEAST(user_record.current_balance, max_rollover);

    -- New balance = monthly allocation + rollover
    new_balance := monthly_allocation + rollover_amount;

    -- Update token balance
    UPDATE public.token_balances
    SET
      balance = new_balance,
      lifetime_earned = lifetime_earned + monthly_allocation,
      updated_at = NOW()
    WHERE user_id = user_record.user_id;

    -- Log the monthly allocation transaction
    INSERT INTO public.token_transactions (
      user_id,
      amount,
      type,
      reason,
      operation,
      balance_after,
      metadata
    ) VALUES (
      user_record.user_id,
      monthly_allocation,
      'earn',
      'Monthly subscription token allocation',
      'subscription_renewal',
      new_balance,
      jsonb_build_object(
        'tier', user_record.tier,
        'monthly_allocation', monthly_allocation,
        'rollover', rollover_amount
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the monthly allocation function
GRANT EXECUTE ON FUNCTION public.allocate_monthly_tokens() TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.token_balances IS 'Stores user token/credit balances';
COMMENT ON TABLE public.token_transactions IS 'Logs all token earn/spend transactions';
COMMENT ON FUNCTION public.allocate_monthly_tokens() IS 'Run monthly to allocate subscription tokens';
