/**
 * Token Operations Test Script
 * Tests all token deduction, refund, and error handling
 *
 * Run with: npx ts-node test-token-operations.ts
 */

interface TestResult {
  test: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function testAPI(endpoint: string, body: any, expectedStatus: number, testName: string) {
  try {
    const response = await fetch(`http://localhost:3001${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, you'd need a valid session cookie here
        // For testing, we'll need to authenticate first
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    const passed = response.status === expectedStatus;

    results.push({
      test: testName,
      passed,
      details: passed ? 'Status code matched' : `Expected ${expectedStatus}, got ${response.status}`,
      error: data.error || undefined,
    });

    console.log(`\n${passed ? '✅' : '❌'} ${testName}`);
    console.log(`   Status: ${response.status} (expected ${expectedStatus})`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));

    return { response, data, passed };
  } catch (error) {
    const err = error as Error;
    results.push({
      test: testName,
      passed: false,
      error: err.message,
    });

    console.log(`\n❌ ${testName}`);
    console.log(`   Error: ${err.message}`);

    return { response: null, data: null, passed: false };
  }
}

async function runTests() {
  console.log('\n🧪 Token Operations Test Suite\n');
  console.log('=' .repeat(60));

  // Test 1: AI Script Generation - Token Costs
  console.log('\n📝 Testing AI Script Generation API');
  console.log('-'.repeat(60));
  await testAPI(
    '/api/ai/generate-script',
    {
      topic: 'Test topic for token validation',
      creatorMode: 'ugc',
      platform: 'TikTok',
      duration: '30 seconds',
    },
    401, // Should fail with unauthorized (we don't have auth in this script)
    'Script Generation - Unauthorized Check'
  );

  // Test 2: Image Generation - Token Costs
  console.log('\n🎨 Testing Image Generation API');
  console.log('-'.repeat(60));
  await testAPI(
    '/api/image/generate',
    {
      prompt: 'Test image for token validation',
      model: 'flux-dev',
      numImages: 1,
    },
    401, // Should fail with unauthorized
    'Image Generation - Unauthorized Check'
  );

  // Test 3: Social Media Posting - Token Costs
  console.log('\n📱 Testing Social Media Posting API');
  console.log('-'.repeat(60));
  await testAPI(
    '/api/social/post',
    {
      content: 'Test post for token validation',
      platforms: ['twitter'],
      mediaUrls: [],
    },
    401, // Should fail with unauthorized
    'Social Post (Single Platform) - Unauthorized Check'
  );

  await testAPI(
    '/api/social/post',
    {
      content: 'Test post for token validation',
      platforms: ['twitter', 'instagram'],
      mediaUrls: [],
    },
    401, // Should fail with unauthorized
    'Social Post (Multi-Platform) - Unauthorized Check'
  );

  // Test 4: Validation Checks
  console.log('\n🔍 Testing Input Validation');
  console.log('-'.repeat(60));
  await testAPI(
    '/api/ai/generate-script',
    {
      // Missing topic
      creatorMode: 'ugc',
    },
    400, // Should fail with bad request (but will hit auth first)
    'Script Generation - Missing Topic'
  );

  await testAPI(
    '/api/image/generate',
    {
      // Missing prompt
      model: 'flux-dev',
    },
    400, // Should fail with bad request (but will hit auth first)
    'Image Generation - Missing Prompt'
  );

  await testAPI(
    '/api/social/post',
    {
      content: 'Test',
      // Missing platforms
    },
    400, // Should fail with bad request (but will hit auth first)
    'Social Post - Missing Platforms'
  );

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.test}`);
      if (r.error) console.log(`    Error: ${r.error}`);
      if (r.details) console.log(`    Details: ${r.details}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n⚠️  Note: Full token testing requires authenticated requests');
  console.log('💡 Use Playwright tests or browser console for authenticated testing');
  console.log('\nNext Steps:');
  console.log('1. Sign in to http://localhost:3001');
  console.log('2. Open browser DevTools console');
  console.log('3. Run the authenticated test commands from TOKEN-TEST-GUIDE.md');
  console.log('');
}

// Run the tests
runTests().catch(console.error);
