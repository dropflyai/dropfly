const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyBuckets() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Checking storage buckets...\n');

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`✅ Found ${buckets.length} bucket(s):\n`);
  buckets.forEach(bucket => {
    console.log(`📦 ${bucket.name}`);
    console.log(`   ID: ${bucket.id}`);
    console.log(`   Public: ${bucket.public}`);
    console.log(`   Created: ${bucket.created_at}`);
    console.log('');
  });
}

verifyBuckets();
