-- Token/Credit System Migration (Idempotent Version)
-- Safe to run multiple times - won't fail if objects already exist

-- Token Balances Table
CREATE TABLE IF NOT EXISTS public.token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  daily_spent INTEGER NOT NULL DEFAULT 0,
  daily_limit INTEGER NOT NULL DEFAULT 15,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
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
CREATE INDEX IF NOT EXISTS idx_token_balances_user_id ON public.token_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON public.token_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_transactions_operation ON public.token_transactions(operation);

-- RLS Policies
ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (safe approach)
DROP POLICY IF EXISTS "Users can view own token balance" ON public.token_balances;
CREATE POLICY "Users can view own token balance"
  ON public.token_balances
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own token transactions" ON public.token_transactions;
CREATE POLICY "Users can view own token transactions"
  ON public.token_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Function to initialize token balance for new users
CREATE OR REPLACE FUNCTION public.initialize_token_balance()
RETURNS TRIGGER AS $$
DECLARE
  initial_tokens INTEGER;
  initial_daily_limit INTEGER;
BEGIN
  -- Get initial token allocation based on user's tier (default to free tier)
  initial_tokens := 300; -- Free tier default
  initial_daily_limit := 15; -- Free tier daily limit

  -- Insert initial token balance
  INSERT INTO public.token_balances (
    user_id,
    balance,
    lifetime_earned,
    daily_spent,
    daily_limit,
    last_reset_date
  )
  VALUES (
    NEW.id,
    initial_tokens,
    initial_tokens,
    0,
    initial_daily_limit,
    CURRENT_DATE
  )
  ON CONFLICT (user_id) DO NOTHING;

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
-- NO ROLLOVER - Use it or lose it model. Drives upgrades.
CREATE OR REPLACE FUNCTION public.allocate_monthly_tokens()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
  monthly_allocation INTEGER;
  daily_token_limit INTEGER;
BEGIN
  -- Loop through all active subscription users
  FOR user_record IN
    SELECT
      u.id as user_id,
      COALESCE(p.subscription_tier, 'free') as tier
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

    -- Determine daily limit based on tier
    daily_token_limit := CASE user_record.tier
      WHEN 'free' THEN 15
      WHEN 'starter' THEN 90
      WHEN 'creator' THEN 180
      WHEN 'pro' THEN 300
      WHEN 'agency' THEN 600
      WHEN 'enterprise' THEN 1000
      ELSE 15
    END;

    -- Update token balance (NO ROLLOVER - reset to monthly allocation)
    UPDATE public.token_balances
    SET
      balance = monthly_allocation,
      lifetime_earned = lifetime_earned + monthly_allocation,
      daily_spent = 0, -- Reset daily spending on monthly renewal
      daily_limit = daily_token_limit,
      last_reset_date = CURRENT_DATE,
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
      'Monthly subscription token allocation (unused tokens from last month lost)',
      'subscription_renewal',
      monthly_allocation,
      jsonb_build_object(
        'tier', user_record.tier,
        'monthly_allocation', monthly_allocation,
        'no_rollover', true
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
