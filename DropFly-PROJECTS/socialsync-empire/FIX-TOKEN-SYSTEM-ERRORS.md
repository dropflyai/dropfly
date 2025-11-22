# Fix Token System Errors

## Errors You're Seeing

1. ❌ `Could not find the 'daily_spent' column of 'token_balances' in the schema cache`
2. ❌ `new row violates row-level security policy for table "token_transactions"`

## Root Cause

Your database has an outdated token system schema that's missing:
- Daily tracking columns (`daily_spent`, `daily_limit`, `last_reset_date`)
- RLS policies that allow server-side INSERT operations

## Complete Fix (Run Both SQL Scripts)

### Step 1: Go to Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run Script #1 - Add Missing Columns

Copy and paste this entire script:

```sql
-- ============================================
-- SCRIPT #1: Add Daily Tracking Columns
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

SELECT 'Script #1 completed - Daily tracking columns added!' as message;
```

Click **Run** and wait for "Script #1 completed" message.

### Step 3: Run Script #2 - Fix RLS Policies

Click **New Query** again, then copy and paste:

```sql
-- ============================================
-- SCRIPT #2: Fix RLS Policies
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

SELECT 'Script #2 completed - RLS policies fixed!' as message;
```

Click **Run** and wait for "Script #2 completed" message.

### Step 4: Restart Your Dev Server

In your terminal where the dev server is running:

1. Press `Ctrl + C` to stop the server
2. Run: `npm run dev`
3. Wait for it to start

### Step 5: Verify the Fix

After restarting, check:

1. **Database Columns** (Supabase Dashboard → Table Editor → token_balances):
   - ✅ `daily_spent` column exists
   - ✅ `daily_limit` column exists
   - ✅ `last_reset_date` column exists

2. **RLS Policies** (Supabase Dashboard → Table Editor → token_transactions → RLS):
   - ✅ "Users can view own token transactions" (SELECT)
   - ✅ "Service role can insert token transactions" (INSERT)
   - ✅ "Service role can update token transactions" (UPDATE)

3. **Test the App**:
   - Refresh your app
   - Try generating a script
   - Should work without errors

## What These Changes Do

### Daily Tracking Columns
- `daily_spent` - Tracks how many tokens used today
- `daily_limit` - Maximum tokens per day (prevents abuse)
- `last_reset_date` - Automatically resets daily_spent at midnight

### RLS Policies
- Allows server-side API routes to create token transactions
- Users can only view their own transactions
- Service role can manage all operations (needed for server-side code)

## Expected Behavior After Fix

✅ Script generation should work
✅ Token balance should update correctly
✅ Daily limits should be enforced
✅ No more RLS errors
✅ Tier display shows "Free Plan" correctly

## If You Still See Errors

1. Make sure BOTH scripts ran successfully
2. Restart your dev server
3. Clear your browser cache
4. Check the server logs for new error details

## Daily Limits by Tier

After the fix, these limits will be enforced:
- **Free**: 50 tokens/day
- **Starter**: 200 tokens/day
- **Creator**: 500 tokens/day
- **Pro**: 1000 tokens/day
- **Enterprise**: 5000 tokens/day

The `daily_limit` column will be automatically updated when you implement the subscription tier integration.
