# Fix: Missing daily_spent Column Error

## Problem
The error `Could not find the 'daily_spent' column of 'token_balances' in the schema cache` means your database has the old token_balances schema without the daily tracking columns.

## Solution
Run the migration to add the missing columns.

## Steps to Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
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
```

6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see: "Daily tracking columns added successfully!"

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
cd /Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/socialsync-empire

# Apply the migration
npx supabase db push
```

## Verify the Fix

After running the migration, verify it worked:

1. In Supabase Dashboard, go to **Table Editor**
2. Select **token_balances** table
3. Check that these columns exist:
   - `daily_spent` (integer)
   - `daily_limit` (integer)
   - `last_reset_date` (date)

## What These Columns Do

- **`daily_spent`**: Tracks how many tokens the user has spent today
- **`daily_limit`**: Maximum tokens user can spend per day (prevents abuse)
- **`last_reset_date`**: Tracks when daily_spent was last reset to 0

## Daily Limit by Tier

These limits are set in the tier configuration:
- **Free**: 50 tokens/day
- **Starter**: 200 tokens/day
- **Creator**: 500 tokens/day
- **Pro**: 1000 tokens/day
- **Enterprise**: 5000 tokens/day

## After Fixing

1. Refresh your app
2. The error should be gone
3. Try generating a script again
4. Check server logs for the auth debugging info

## Need Help?

If you still see the error after running the migration:
1. Check if the migration actually ran (look for success message)
2. Try refreshing the Supabase schema cache (Restart your dev server)
3. Check the server logs for more details
