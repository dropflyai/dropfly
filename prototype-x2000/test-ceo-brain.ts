/**
 * Test CEO Brain Orchestration
 */

import { ceoBrain } from './src/brains/ceo/index.js';

async function testCEOBrain() {
  console.log('======================================================================');
  console.log('Testing AI-Powered CEO Brain Orchestration');
  console.log('======================================================================\n');

  // Test 1: Direct strategic question
  console.log('📋 Test 1: Direct strategic question to CEO\n');
  try {
    const response = await ceoBrain.chat(
      'What are the key factors to consider when launching a B2B SaaS product?'
    );
    console.log('CEO Response (first 500 chars):');
    console.log('-'.repeat(50));
    console.log(response.slice(0, 500) + '...');
    console.log('-'.repeat(50) + '\n');
  } catch (error) {
    console.error('Error in Test 1:', error);
  }

  // Test 2: Full orchestration
  console.log('📋 Test 2: Full orchestration with task decomposition\n');
  try {
    const result = await ceoBrain.orchestrate(
      'Create a go-to-market strategy for an AI-powered code review tool targeting enterprise developers.'
    );
    console.log('Orchestration Result:');
    console.log('-'.repeat(50));
    console.log('Success:', result.success);
    console.log('Duration:', result.duration, 'ms');
    if (result.output) {
      const output = typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2);
      console.log('Output (first 1000 chars):');
      console.log(output.slice(0, 1000));
    }
    console.log('-'.repeat(50) + '\n');
  } catch (error) {
    console.error('Error in Test 2:', error);
  }

  console.log('✅ Tests completed!');
}

testCEOBrain().catch(console.error);
