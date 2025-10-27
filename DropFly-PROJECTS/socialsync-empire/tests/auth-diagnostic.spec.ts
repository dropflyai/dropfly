import { test, expect, Page } from '@playwright/test';

/**
 * COMPREHENSIVE AUTHENTICATION DIAGNOSTIC TEST
 *
 * This test provides detailed diagnostics for the SocialSync signup flow.
 * It captures:
 * - All network requests and responses
 * - Console logs, errors, and warnings
 * - Screenshots at key points
 * - Session state and cookies
 * - Local storage state
 * - Detailed timing information
 */

test.describe('Auth Flow Diagnostic', () => {
  const baseURL = 'http://localhost:3001';
  // Using real email domain (@gmail.com) so Supabase accepts it
  // Gmail's + addressing: test+something@gmail.com all go to test@gmail.com
  const testEmail = `socialsync.test+diagnostic${Date.now()}@gmail.com`;
  const testPassword = 'DiagnosticTest123!';
  const testName = 'Diagnostic Test User';

  // Storage for captured data
  let networkRequests: any[] = [];
  let consoleMessages: any[] = [];
  let pageErrors: any[] = [];

  test.beforeEach(async ({ page }) => {
    // Reset capture arrays
    networkRequests = [];
    consoleMessages = [];
    pageErrors = [];

    console.log('\n========================================');
    console.log('🔍 STARTING DIAGNOSTIC TEST');
    console.log('========================================');
    console.log(`Test Email: ${testEmail}`);
    console.log(`Test Password: ${testPassword}`);
    console.log(`Test Name: ${testName}`);
    console.log('========================================\n');

    // Capture all network requests
    page.on('request', request => {
      const requestData = {
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData(),
        resourceType: request.resourceType(),
      };
      networkRequests.push(requestData);
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);

      // Log Supabase API calls with extra detail
      if (request.url().includes('supabase')) {
        console.log(`   🔸 SUPABASE API CALL`);
        console.log(`   Headers:`, JSON.stringify(request.headers(), null, 2));
        if (request.postData()) {
          console.log(`   Body:`, request.postData());
        }
      }
    });

    // Capture all network responses
    page.on('response', async response => {
      const responseData: any = {
        timestamp: new Date().toISOString(),
        status: response.status(),
        statusText: response.statusText(),
        url: response.url(),
        headers: response.headers(),
      };

      // Try to capture response body for Supabase calls
      if (response.url().includes('supabase')) {
        try {
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('application/json')) {
            responseData.body = await response.json();
          } else {
            responseData.body = await response.text();
          }
        } catch (e) {
          responseData.body = '[Could not parse response body]';
        }

        console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
        console.log(`   🔸 SUPABASE RESPONSE`);
        console.log(`   Status: ${response.status()} ${response.statusText()}`);
        console.log(`   Body:`, JSON.stringify(responseData.body, null, 2));
      }
    });

    // Capture console messages
    page.on('console', msg => {
      const consoleData = {
        timestamp: new Date().toISOString(),
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
      };
      consoleMessages.push(consoleData);

      const icon = msg.type() === 'error' ? '❌' :
                   msg.type() === 'warning' ? '⚠️' :
                   msg.type() === 'log' ? '📝' : '💬';

      console.log(`${icon} CONSOLE [${msg.type().toUpperCase()}]: ${msg.text()}`);
    });

    // Capture page errors
    page.on('pageerror', error => {
      const errorData = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
      };
      pageErrors.push(errorData);
      console.log(`🚨 PAGE ERROR: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    });

    // Capture failed requests
    page.on('requestfailed', request => {
      console.log(`❌ REQUEST FAILED: ${request.method()} ${request.url()}`);
      console.log(`   Failure: ${request.failure()?.errorText}`);
    });
  });

  test('DIAGNOSTIC: Complete signup flow analysis', async ({ page }) => {
    console.log('\n========================================');
    console.log('STEP 1: Navigate to signup page');
    console.log('========================================');

    await page.goto(`${baseURL}/signup`);
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({
      path: `/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/socialsync-empire/tests/diagnostic-01-initial.png`,
      fullPage: true
    });
    console.log('✅ Screenshot saved: diagnostic-01-initial.png');

    // Check initial state
    console.log('\n📊 INITIAL STATE CHECK:');
    const initialCookies = await page.context().cookies();
    console.log(`   Cookies: ${initialCookies.length} cookies found`);
    console.log(`   Details:`, JSON.stringify(initialCookies, null, 2));

    const initialLocalStorage = await page.evaluate(() => {
      return Object.keys(localStorage).reduce((acc: any, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {});
    });
    console.log(`   LocalStorage:`, JSON.stringify(initialLocalStorage, null, 2));

    console.log('\n========================================');
    console.log('STEP 2: Fill out signup form');
    console.log('========================================');

    // Verify form elements exist
    const nameInput = page.locator('input[type="text"]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Create Account")');

    console.log('🔍 Verifying form elements...');
    await expect(nameInput).toBeVisible();
    console.log('   ✅ Name input found');
    await expect(emailInput).toBeVisible();
    console.log('   ✅ Email input found');
    await expect(passwordInput).toBeVisible();
    console.log('   ✅ Password input found');
    await expect(submitButton).toBeVisible();
    console.log('   ✅ Submit button found');

    // Fill form fields
    console.log('\n📝 Filling form fields...');
    await nameInput.fill(testName);
    console.log(`   ✅ Name: ${testName}`);
    await emailInput.fill(testEmail);
    console.log(`   ✅ Email: ${testEmail}`);
    await passwordInput.fill(testPassword);
    console.log(`   ✅ Password: ${testPassword}`);

    // Take screenshot before submit
    await page.screenshot({
      path: `/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/socialsync-empire/tests/diagnostic-02-form-filled.png`,
      fullPage: true
    });
    console.log('✅ Screenshot saved: diagnostic-02-form-filled.png');

    console.log('\n========================================');
    console.log('STEP 3: Submit form and monitor response');
    console.log('========================================');

    const beforeSubmitTime = Date.now();
    console.log(`⏱️  Submit time: ${new Date(beforeSubmitTime).toISOString()}`);

    // Submit form
    await submitButton.click();
    console.log('✅ Form submitted');

    // Wait a bit to capture immediate responses
    await page.waitForTimeout(2000);

    const afterSubmitTime = Date.now();
    console.log(`⏱️  Response time: ${new Date(afterSubmitTime).toISOString()}`);
    console.log(`⏱️  Elapsed: ${afterSubmitTime - beforeSubmitTime}ms`);

    // Take screenshot after submit
    await page.screenshot({
      path: `/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/socialsync-empire/tests/diagnostic-03-after-submit.png`,
      fullPage: true
    });
    console.log('✅ Screenshot saved: diagnostic-03-after-submit.png');

    console.log('\n========================================');
    console.log('STEP 4: Check authentication state');
    console.log('========================================');

    // Check for error messages
    const errorElement = page.locator('.text-red-500, [class*="error"]');
    const hasError = await errorElement.count() > 0;
    if (hasError) {
      const errorText = await errorElement.first().textContent();
      console.log(`❌ ERROR MESSAGE DISPLAYED: ${errorText}`);
    } else {
      console.log('✅ No error messages visible');
    }

    // Check for success message
    const successElement = page.locator('text=Welcome to SocialSync!');
    const hasSuccess = await successElement.count() > 0;
    if (hasSuccess) {
      console.log('✅ SUCCESS MESSAGE DISPLAYED');
      await page.screenshot({
        path: `/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/socialsync-empire/tests/diagnostic-04-success-message.png`,
        fullPage: true
      });
      console.log('✅ Screenshot saved: diagnostic-04-success-message.png');
    } else {
      console.log('❌ No success message visible');
    }

    // Check cookies after submit
    const postSubmitCookies = await page.context().cookies();
    console.log(`\n🍪 POST-SUBMIT COOKIES: ${postSubmitCookies.length} cookies`);
    console.log(`   Details:`, JSON.stringify(postSubmitCookies, null, 2));

    // Check auth-related cookies
    const authCookies = postSubmitCookies.filter(c =>
      c.name.includes('auth') || c.name.includes('supabase') || c.name.includes('sb-')
    );
    if (authCookies.length > 0) {
      console.log(`   ✅ Found ${authCookies.length} auth-related cookies:`);
      authCookies.forEach(c => {
        console.log(`      - ${c.name}: ${c.value.substring(0, 50)}...`);
      });
    } else {
      console.log(`   ⚠️  No auth-related cookies found!`);
    }

    // Check localStorage
    const postSubmitLocalStorage = await page.evaluate(() => {
      return Object.keys(localStorage).reduce((acc: any, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {});
    });
    console.log(`\n💾 POST-SUBMIT LOCAL STORAGE:`);
    console.log(JSON.stringify(postSubmitLocalStorage, null, 2));

    // Check for Supabase session in localStorage
    const supabaseKeys = Object.keys(postSubmitLocalStorage).filter(k =>
      k.includes('supabase') || k.includes('sb-')
    );
    if (supabaseKeys.length > 0) {
      console.log(`   ✅ Found ${supabaseKeys.length} Supabase storage keys`);
      supabaseKeys.forEach(key => {
        try {
          const data = JSON.parse(postSubmitLocalStorage[key]);
          console.log(`\n   📦 ${key}:`);
          console.log(`      Access token: ${data.access_token ? 'Present' : 'Missing'}`);
          console.log(`      Refresh token: ${data.refresh_token ? 'Present' : 'Missing'}`);
          console.log(`      User: ${data.user ? data.user.email : 'Missing'}`);
          console.log(`      Expires at: ${data.expires_at}`);
        } catch (e) {
          console.log(`      Raw value: ${postSubmitLocalStorage[key].substring(0, 100)}...`);
        }
      });
    } else {
      console.log(`   ⚠️  No Supabase storage keys found!`);
    }

    console.log('\n========================================');
    console.log('STEP 5: Check for redirect');
    console.log('========================================');

    // Get current URL
    const currentURL = page.url();
    console.log(`📍 Current URL: ${currentURL}`);

    // Wait for potential redirect
    console.log('⏳ Waiting for potential redirect (10 seconds)...');
    try {
      await page.waitForURL(/\/home$/, { timeout: 10000 });
      console.log('✅ REDIRECT SUCCESSFUL to /home');

      await page.screenshot({
        path: `/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/socialsync-empire/tests/diagnostic-05-redirected.png`,
        fullPage: true
      });
      console.log('✅ Screenshot saved: diagnostic-05-redirected.png');
    } catch (e) {
      console.log('❌ REDIRECT DID NOT OCCUR');
      console.log(`   Still on: ${page.url()}`);

      await page.screenshot({
        path: `/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/socialsync-empire/tests/diagnostic-05-no-redirect.png`,
        fullPage: true
      });
      console.log('✅ Screenshot saved: diagnostic-05-no-redirect.png');
    }

    console.log('\n========================================');
    console.log('STEP 6: Summary of captured data');
    console.log('========================================');

    // Summary of network requests
    console.log(`\n📊 NETWORK REQUESTS SUMMARY:`);
    console.log(`   Total requests: ${networkRequests.length}`);

    const supabaseRequests = networkRequests.filter(r => r.url.includes('supabase'));
    console.log(`   Supabase requests: ${supabaseRequests.length}`);
    if (supabaseRequests.length > 0) {
      console.log('\n   Supabase API calls:');
      supabaseRequests.forEach((req, idx) => {
        console.log(`   ${idx + 1}. ${req.method} ${req.url}`);
        if (req.postData) {
          console.log(`      Data: ${req.postData.substring(0, 100)}...`);
        }
      });
    }

    // Summary of console messages
    console.log(`\n📊 CONSOLE MESSAGES SUMMARY:`);
    console.log(`   Total messages: ${consoleMessages.length}`);
    console.log(`   Errors: ${consoleMessages.filter(m => m.type === 'error').length}`);
    console.log(`   Warnings: ${consoleMessages.filter(m => m.type === 'warning').length}`);

    const errors = consoleMessages.filter(m => m.type === 'error');
    if (errors.length > 0) {
      console.log('\n   Console Errors:');
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.text}`);
      });
    }

    // Summary of page errors
    console.log(`\n📊 PAGE ERRORS SUMMARY:`);
    console.log(`   Total page errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      console.log('\n   Page Errors:');
      pageErrors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.message}`);
        console.log(`      ${err.stack}`);
      });
    }

    console.log('\n========================================');
    console.log('STEP 7: Detailed auth state analysis');
    console.log('========================================');

    // Try to get Supabase session via client
    const sessionCheck = await page.evaluate(async () => {
      try {
        // @ts-ignore - accessing global Supabase client if available
        if (window.supabase) {
          // @ts-ignore
          const { data, error } = await window.supabase.auth.getSession();
          return { data, error, available: true };
        }
        return { available: false };
      } catch (e) {
        return { error: String(e), available: false };
      }
    });

    console.log('🔐 Supabase Session Check:');
    console.log(JSON.stringify(sessionCheck, null, 2));

    console.log('\n========================================');
    console.log('🏁 DIAGNOSTIC TEST COMPLETE');
    console.log('========================================');
    console.log(`Screenshots saved in: /Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/socialsync-empire/tests/`);
    console.log('========================================\n');

    // Final assertion - this will fail if redirect didn't happen, giving us the full diagnostic output
    expect(page.url()).toContain('/home');
  });

  test('DIAGNOSTIC: Network-only analysis', async ({ page }) => {
    console.log('\n========================================');
    console.log('NETWORK-ONLY DIAGNOSTIC TEST');
    console.log('========================================\n');

    // Navigate to signup
    await page.goto(`${baseURL}/signup`);
    await page.waitForLoadState('networkidle');

    // Fill and submit form
    await page.locator('input[type="text"]').fill(testName);
    await page.locator('input[type="email"]').fill(`socialsync.test+network${Date.now()}@gmail.com`);
    await page.locator('input[type="password"]').fill(testPassword);

    console.log('📤 Submitting form, capturing all network activity...\n');

    await page.locator('button:has-text("Create Account")').click();

    // Wait for network to settle
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n========================================');
    console.log('COMPLETE NETWORK LOG:');
    console.log('========================================\n');

    networkRequests.forEach((req, idx) => {
      console.log(`\n[${idx + 1}] ${req.method} ${req.url}`);
      console.log(`    Time: ${req.timestamp}`);
      console.log(`    Type: ${req.resourceType}`);
      if (req.postData) {
        console.log(`    Body: ${req.postData}`);
      }
    });

    console.log('\n========================================\n');
  });
});
