-- Add daily tracking columns to token_balances table
-- This migration adds the missing columns that are needed for daily limit tracking

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

SELECT 'Daily tracking columns added successfully!' as message;
