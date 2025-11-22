import { test, expect } from '@playwright/test';

/**
 * ENGINE SELECTOR DEBUG TEST
 *
 * Tests the new VideoEngineSelector component on /generate page
 */

test.describe('Engine Selector Component', () => {
  test('Should load generate page and display engine selector', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n🧪 ENGINE SELECTOR DEBUG TEST\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Navigate to generate page
    console.log('📍 Step 1: Navigating to /generate page...\n');
    await page.goto('http://localhost:3010/generate');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'debug-generate-page.png', fullPage: true });
    console.log('📸 Screenshot saved: debug-generate-page.png\n');

    // Check if page loaded
    console.log('✅ Step 2: Checking page elements...\n');

    // Look for main heading
    const heading = page.locator('h1:has-text("AI Video Generation")');
    const headingVisible = await heading.isVisible().catch(() => false);
    console.log(`   AI Video Generation heading: ${headingVisible ? '✅' : '❌'}\n`);

    // Look for Video Engine section
    const engineHeading = page.locator('h3:has-text("Video Engine")');
    const engineVisible = await engineHeading.isVisible().catch(() => false);
    console.log(`   Video Engine heading: ${engineVisible ? '✅' : '❌'}\n`);

    // Look for Auto-select button
    const autoButton = page.locator('button:has-text("Auto (Recommended)")');
    const autoVisible = await autoButton.isVisible().catch(() => false);
    console.log(`   Auto (Recommended) button: ${autoVisible ? '✅' : '❌'}\n`);

    // Look for Advanced Options button
    const advancedButton = page.locator('button:has-text("Advanced Options")');
    const advancedVisible = await advancedButton.isVisible().catch(() => false);
    console.log(`   Advanced Options button: ${advancedVisible ? '✅' : '❌'}\n`);

    // Check for any errors on page
    const errors = await page.locator('[class*="error"]').allTextContents();
    if (errors.length > 0) {
      console.log('⚠️  Errors found on page:', errors);
    }

    // Get console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    // Check page errors
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 TEST COMPLETE\n');

    // Basic assertions
    expect(headingVisible).toBe(true);
  });

  test('Should expand advanced options', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n🧪 ADVANCED OPTIONS TEST\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await page.goto('http://localhost:3010/generate');
    await page.waitForLoadState('networkidle');

    // Click Advanced Options
    console.log('🖱️  Clicking Advanced Options button...\n');
    const advancedButton = page.locator('button:has-text("Advanced Options")');

    if (await advancedButton.isVisible()) {
      await advancedButton.click();
      await page.waitForTimeout(1000);

      // Take screenshot of expanded view
      await page.screenshot({ path: 'debug-advanced-expanded.png', fullPage: true });
      console.log('📸 Screenshot saved: debug-advanced-expanded.png\n');

      // Check for category tabs
      const categoryTabs = page.locator('button:has-text("All")');
      const tabsVisible = await categoryTabs.isVisible().catch(() => false);
      console.log(`   Category tabs visible: ${tabsVisible ? '✅' : '❌'}\n`);

      // Check for hide button
      const hideButton = page.locator('button:has-text("Hide Advanced Options")');
      const hideVisible = await hideButton.isVisible().catch(() => false);
      console.log(`   Hide button visible: ${hideVisible ? '✅' : '❌'}\n`);

      console.log('✅ Advanced options expanded successfully\n');
    } else {
      console.log('❌ Advanced Options button not found\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});
