#!/usr/bin/env node

/**
 * Credit tokens back to user for refund bug
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function creditTokens() {
  const userId = 'a29fe625-5e29-459d-b7a1-c30d1a6d3532'; // homeflyai@gmail.com
  const amount = 28; // 4 failed attempts × 7 tokens each

  console.log('🔧 Crediting tokens for refund bug compensation...');
  console.log(`   User ID: ${userId}`);
  console.log(`   Amount: ${amount} tokens`);
  console.log('');

  try {
    // 1. Get current balance
    const { data: balance, error: balanceError } = await supabase
      .from('token_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (balanceError || !balance) {
      console.error('❌ Failed to get user balance:', balanceError);
      process.exit(1);
    }

    console.log('📊 Current balance:', balance.balance);

    // 2. Update balance
    const newBalance = balance.balance + amount;
    const newLifetimeEarned = balance.lifetime_earned + amount;

    const { error: updateError } = await supabase
      .from('token_balances')
      .update({
        balance: newBalance,
        lifetime_earned: newLifetimeEarned,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Failed to update balance:', updateError);
      process.exit(1);
    }

    console.log('✅ Updated balance:', newBalance);
    console.log('');

    // 3. Create transaction record
    const { error: transactionError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        type: 'bonus',
        amount: amount,
        operation: 'admin_credit',
        reason: 'Compensation for refund bug - 4 failed API attempts',
        balance_after: newBalance,
        metadata: {
          compensation_type: 'refund_bug_compensation',
          original_issue: 'Refund function was not working due to wrong parameters',
          failed_attempts: 4,
          tokens_per_attempt: 7
        }
      });

    if (transactionError) {
      console.error('❌ Failed to create transaction:', transactionError);
      process.exit(1);
    }

    console.log('✅ Transaction recorded');
    console.log('');
    console.log('🎉 Successfully credited 28 tokens!');
    console.log(`   New total: ${newBalance} tokens`);

  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
}

creditTokens();
