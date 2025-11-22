#!/usr/bin/env node

const SUPABASE_URL = 'https://zoiewcelmnaasbsfcjaj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaWV3Y2VsbW5hYXNic2ZjamFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM0NDAwMywiZXhwIjoyMDc2OTIwMDAzfQ.559k8nhRc3NLA1Kz39JSpOjQky98TIDjA1PWqX1xfAE';

console.log('🔧 Automating token system fixes...\n');

async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL Error: ${error}`);
  }

  return response.json();
}

async function executeDirectSQL(sql) {
  // Use PostgREST raw SQL endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'X-Client-Info': 'token-fix-script'
    },
    body: JSON.stringify({ sql })
  });

  return response;
}

async function alterTableDirectly() {
  console.log('Step 1: Adding daily_spent column...');

  const queries = [
    // Add columns with IF NOT EXISTS logic
    `ALTER TABLE public.token_balances ADD COLUMN IF NOT EXISTS daily_spent INTEGER DEFAULT 0;`,
    `ALTER TABLE public.token_balances ADD COLUMN IF NOT EXISTS daily_limit INTEGER DEFAULT 15;`,
    `ALTER TABLE public.token_balances ADD COLUMN IF NOT EXISTS last_reset_date DATE DEFAULT CURRENT_DATE;`,

    // Drop and recreate policies
    `DROP POLICY IF EXISTS "Service role can insert token transactions" ON public.token_transactions;`,
    `CREATE POLICY "Service role can insert token transactions" ON public.token_transactions FOR INSERT WITH CHECK (true);`,

    `DROP POLICY IF EXISTS "Service role can update token transactions" ON public.token_transactions;`,
    `CREATE POLICY "Service role can update token transactions" ON public.token_transactions FOR UPDATE USING (true);`,

    `DROP POLICY IF EXISTS "Service role can manage token balances" ON public.token_balances;`,
    `CREATE POLICY "Service role can manage token balances" ON public.token_balances FOR ALL USING (true) WITH CHECK (true);`
  ];

  // Use pg connection string with node-postgres
  const { Client } = await import('pg');

  const client = new Client({
    host: 'db.zoiewcelmnaasbsfcjaj.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'fRCbtIVdcwRiEuH5',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    for (const query of queries) {
      console.log(`Executing: ${query.substring(0, 60)}...`);
      try {
        await client.query(query);
        console.log('  ✅ Success\n');
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('does not exist')) {
          console.log('  ⚠️  Already exists, skipping\n');
        } else {
          console.error('  ❌ Error:', err.message);
        }
      }
    }

    await client.end();
    console.log('\n🎉 Token system fixes completed!');

  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
}

// Run it
alterTableDirectly();
