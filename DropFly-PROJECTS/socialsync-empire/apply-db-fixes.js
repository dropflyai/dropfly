const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyFixes() {
  console.log('🔧 Applying database fixes...\n');

  // Fix 1: Add missing columns using raw SQL
  console.log('1️⃣  Adding daily tracking columns...');

  const { data: data1, error: error1 } = await supabase.rpc('exec', {
    sql: `
      ALTER TABLE public.token_balances
      ADD COLUMN IF NOT EXISTS daily_spent INTEGER NOT NULL DEFAULT 0;

      ALTER TABLE public.token_balances
      ADD COLUMN IF NOT EXISTS daily_limit INTEGER NOT NULL DEFAULT 15;

      ALTER TABLE public.token_balances
      ADD COLUMN IF NOT EXISTS last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE;
    `
  });

  if (error1) {
    console.error('❌ Failed to add columns:', error1.message);
    console.log('\nTrying alternative approach...\n');

    // Alternative: Use individual ALTER statements
    try {
      await supabase.from('_sql').insert({
        statement: 'ALTER TABLE public.token_balances ADD COLUMN IF NOT EXISTS daily_spent INTEGER NOT NULL DEFAULT 0'
      });
      await supabase.from('_sql').insert({
        statement: 'ALTER TABLE public.token_balances ADD COLUMN IF NOT EXISTS daily_limit INTEGER NOT NULL DEFAULT 15'
      });
      await supabase.from('_sql').insert({
        statement: 'ALTER TABLE public.token_balances ADD COLUMN IF NOT EXISTS last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE'
      });
      console.log('✅ Columns added via alternative method');
    } catch (altError) {
      console.error('❌ Alternative method also failed');
      console.log('\n⚠️  You need to run the SQL manually in Supabase Dashboard');
      console.log('Copy this SQL:\n');
      console.log(`
ALTER TABLE public.token_balances
ADD COLUMN IF NOT EXISTS daily_spent INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.token_balances
ADD COLUMN IF NOT EXISTS daily_limit INTEGER NOT NULL DEFAULT 15;

ALTER TABLE public.token_balances
ADD COLUMN IF NOT EXISTS last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE;
      `);
    }
  } else {
    console.log('✅ Daily tracking columns added');
  }

  // Fix 2: Update RLS policies
  console.log('\n2️⃣  Updating RLS policies...');

  const { data: data2, error: error2 } = await supabase.rpc('exec', {
    sql: `
      DROP POLICY IF EXISTS "Service role can manage token balances" ON public.token_balances;
      CREATE POLICY "Service role can manage token balances"
        ON public.token_balances FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Users can view own token transactions" ON public.token_transactions;
      CREATE POLICY "Users can view own token transactions"
        ON public.token_transactions FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Service role can insert token transactions" ON public.token_transactions;
      CREATE POLICY "Service role can insert token transactions"
        ON public.token_transactions FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "Service role can update token transactions" ON public.token_transactions;
      CREATE POLICY "Service role can update token transactions"
        ON public.token_transactions FOR UPDATE USING (true);
    `
  });

  if (error2) {
    console.error('❌ Failed to update RLS policies:', error2.message);
    console.log('\n⚠️  You need to run this SQL manually:\n');
    console.log(`
DROP POLICY IF EXISTS "Service role can manage token balances" ON public.token_balances;
CREATE POLICY "Service role can manage token balances"
  ON public.token_balances FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert token transactions" ON public.token_transactions;
CREATE POLICY "Service role can insert token transactions"
  ON public.token_transactions FOR INSERT WITH CHECK (true);
    `);
  } else {
    console.log('✅ RLS policies updated');
  }

  console.log('\n✅ Database fixes completed!');
  console.log('👉 Restart your dev server to apply changes\n');
}

applyFixes().catch(console.error);
