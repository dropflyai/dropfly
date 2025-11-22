import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://zoiewcelmnaasbsfcjaj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaWV3Y2VsbW5hYXNic2ZjamFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM0NDAwMywiZXhwIjoyMDc2OTIwMDAzfQ.559k8nhRc3NLA1Kz39JSpOjQky98TIDjA1PWqX1xfAE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 Applying token system fixes...\n');

const sql = readFileSync('./temp_fix_tokens.sql', 'utf8');

try {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).select();

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('✅ Token system fixes applied successfully!');
  console.log(data);
} catch (err) {
  // Try direct query instead
  console.log('Trying direct query approach...');

  const { data, error } = await supabase.from('_migrations').select('*');

  if (error) {
    console.error('❌ Cannot connect to database:', error);
    process.exit(1);
  }

  console.log('✅ Connected to database');
  console.log('\n📋 MANUAL STEPS REQUIRED:');
  console.log('1. Go to: https://supabase.com/dashboard/project/zoiewcelmnaasbsfcjaj/sql/new');
  console.log('2. Copy the contents of temp_fix_tokens.sql');
  console.log('3. Paste and run in the SQL Editor');
  console.log('4. Come back and we\'ll continue testing\n');
}
