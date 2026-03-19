import { test, expect } from '@playwright/test';

const hasSupabase = !!(process.env['NEXT_PUBLIC_SUPABASE_URL'] && process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

test.describe('Phase 1 — Auth redirect (requires Supabase)', () => {
  test.skip(!hasSupabase, 'Skipping — NEXT_PUBLIC_SUPABASE_ANON_KEY not set');

  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/today');
    await page.waitForURL('**/login');
    await expect(page.locator('h1')).toContainText('Thriving');
  });

  test('/today route exists and responds', async ({ page }) => {
    const response = await page.goto('/today');
    expect(response?.status()).toBeLessThan(500);
  });

  test('/capture redirects without crashing', async ({ page }) => {
    const response = await page.goto('/capture');
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Phase 1 — Login form interaction', () => {
  test('login page has correct form structure', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('#login-email');
    const passwordInput = page.locator('#login-pw');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    await passwordInput.fill('testpassword');
    await expect(passwordInput).toHaveValue('testpassword');
  });
});
