import { test, expect } from '@playwright/test';

test.describe('SocialSync Authentication E2E Tests', () => {
  const baseURL = 'http://localhost:3001';
  const testEmail = `test-${Date.now()}@socialsync.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  test('should load landing page', async ({ page }) => {
    await page.goto(baseURL);

    // Should show landing page content
    await expect(page.locator('text=Create. Schedule. Grow.')).toBeVisible();
    await expect(page.locator('text=All with AI')).toBeVisible();

    // Should have CTA buttons
    await expect(page.locator('text=Start Free 14-Day Trial').first()).toBeVisible();
    await expect(page.locator('text=Log In')).toBeVisible();

    // Should show pricing section
    await expect(page.locator('text=Simple, transparent pricing')).toBeVisible();
    await expect(page.locator('text=Starter')).toBeVisible();
    await expect(page.locator('text=Creator')).toBeVisible();
    await expect(page.locator('text=Agency')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto(baseURL);

    // Click signup button
    await page.locator('text=Start Free Trial').first().click();

    // Should be on signup page
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.locator('text=Create Account')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto(baseURL);

    // Click login button
    await page.locator('text=Log In').first().click();

    // Should be on login page
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('text=Log In').first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors on empty signup', async ({ page }) => {
    await page.goto(`${baseURL}/signup`);

    // Try to submit empty form
    await page.locator('button:has-text("Create Account")').click();

    // Browser native validation should prevent submission
    const nameInput = page.locator('input[type="text"]');
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should create new account and redirect to home', async ({ page }) => {
    await page.goto(`${baseURL}/signup`);

    // Fill in signup form
    await page.locator('input[type="text"]').fill(testName);
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);

    // Submit form
    await page.locator('button:has-text("Create Account")').click();

    // Should show success message
    await expect(page.locator('text=Welcome to SocialSync!')).toBeVisible({ timeout: 10000 });

    // Should redirect to home
    await expect(page).toHaveURL(/\/home$/, { timeout: 10000 });

    // Should show personalized greeting
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
  });

  test('should login with existing account', async ({ page }) => {
    // First create account
    await page.goto(`${baseURL}/signup`);
    const email = `test-login-${Date.now()}@socialsync.com`;

    await page.locator('input[type="text"]').fill(testName);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.locator('button:has-text("Create Account")').click();

    // Wait for redirect to home
    await expect(page).toHaveURL(/\/home$/, { timeout: 10000 });

    // Now clear cookies and login again
    await page.context().clearCookies();

    // Go to login page
    await page.goto(`${baseURL}/login`);

    // Fill in login form
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(testPassword);

    // Submit
    await page.locator('button:has-text("Log In")').click();

    // Should redirect to home
    await expect(page).toHaveURL(/\/home$/, { timeout: 10000 });
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should show error on invalid login credentials', async ({ page }) => {
    await page.goto(`${baseURL}/login`);

    // Fill in with invalid credentials
    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');

    // Submit
    await page.locator('button:has-text("Log In")').click();

    // Should show error message
    await expect(page.locator('text=/Invalid|incorrect|wrong/i')).toBeVisible({ timeout: 5000 });
  });

  test('should protect routes when not authenticated', async ({ page }) => {
    // Clear all cookies to ensure not authenticated
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto(`${baseURL}/home`);

    // Should redirect to login
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should access protected routes when authenticated', async ({ page }) => {
    // Create account
    await page.goto(`${baseURL}/signup`);
    const email = `test-protected-${Date.now()}@socialsync.com`;

    await page.locator('input[type="text"]').fill(testName);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.locator('button:has-text("Create Account")').click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/home$/, { timeout: 10000 });

    // Now try to access other protected routes
    const protectedRoutes = ['/create', '/post', '/manage', '/tools/downloader'];

    for (const route of protectedRoutes) {
      await page.goto(`${baseURL}${route}`);

      // Should NOT redirect to login
      await expect(page).toHaveURL(`${baseURL}${route}`);

      // Should not show login page
      await expect(page.locator('text=Log In').first()).not.toBeVisible();
    }
  });

  test('should show Google OAuth button', async ({ page }) => {
    await page.goto(`${baseURL}/login`);

    // Should show Google button
    await expect(page.locator('button:has-text("Google")')).toBeVisible();

    // Check on signup page too
    await page.goto(`${baseURL}/signup`);
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
  });

  test('landing page pricing toggle should work', async ({ page }) => {
    await page.goto(baseURL);

    // Scroll to pricing
    await page.locator('text=Simple, transparent pricing').scrollIntoViewIfNeeded();

    // Should default to monthly
    await expect(page.locator('text=$29').first()).toBeVisible();

    // Click annual
    await page.locator('button:has-text("Annual")').click();

    // Should show annual pricing (20% off)
    await expect(page.locator('text=$23').first()).toBeVisible();

    // Click monthly again
    await page.locator('button:has-text("Monthly")').click();

    // Should show monthly pricing
    await expect(page.locator('text=$29').first()).toBeVisible();
  });

  test('should have all landing page sections', async ({ page }) => {
    await page.goto(baseURL);

    // Hero section
    await expect(page.locator('text=Create. Schedule. Grow.')).toBeVisible();

    // Features section
    await expect(page.locator('text=Everything you need to dominate social media')).toBeVisible();

    // Check key features are listed
    await expect(page.locator('text=AI Video Generation')).toBeVisible();
    await expect(page.locator('text=Video Downloader')).toBeVisible();
    await expect(page.locator('text=Watermark Remover')).toBeVisible();
    await expect(page.locator('text=Multi-Platform Scheduling')).toBeVisible();

    // Platforms section
    await expect(page.locator('text=Post everywhere, manage from one place')).toBeVisible();

    // Pricing section
    await expect(page.locator('text=Simple, transparent pricing')).toBeVisible();

    // CTA section
    await expect(page.locator('text=Ready to 10x your content creation?')).toBeVisible();

    // Footer
    await expect(page.locator('text=© 2025 SocialSync')).toBeVisible();
  });
});
