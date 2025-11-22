/**
 * Create Test User for DropFly Campaign
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createTestUser() {
  console.log('🚀 Creating test user for DropFly...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Create auth user
  const email = 'dropfly@test.com';
  const password = 'DropFly2025!';

  console.log('📧 Creating auth user...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });

  if (authError) {
    if (authError.message.includes('already exists')) {
      console.log('✅ User already exists, getting user ID...');
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === email);

      if (existingUser) {
        console.log(`✅ Found existing user: ${existingUser.id}`);
        return existingUser.id;
      }
    } else {
      console.error('❌ Error creating user:', authError.message);
      process.exit(1);
    }
  }

  const userId = authData.user.id;
  console.log(`✅ User created with ID: ${userId}`);

  // Create profile
  console.log('\n👤 Creating user profile...');
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: userId,
      email: email,
      full_name: 'DropFly Test User',
      tier: 'creator',
      token_balance: 10000,
      tokens_used_this_month: 0
    }]);

  if (profileError) {
    if (profileError.code === '23505') {
      console.log('ℹ️  Profile already exists');
    } else {
      console.error('❌ Error creating profile:', profileError.message);
    }
  } else {
    console.log('✅ Profile created successfully');
  }

  console.log('\n✨ Test user ready!');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   User ID: ${userId}`);
  console.log(`\n🔑 Login at: http://localhost:3010/login`);

  return userId;
}

createTestUser()
  .then(userId => {
    console.log('\n✅ Setup complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
