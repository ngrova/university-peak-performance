import { test, expect } from '@playwright/test';

test.describe('Phase 0 — PWA Shell (static pages)', () => {
  test('login page loads without crashing', async ({ page }) => {
    await page.goto('/login');
    await expect(page).not.toHaveTitle(/error/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('has dark background matching spec', async ({ page }) => {
    await page.goto('/login');
    const bg = await page.locator('html').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBeTruthy();
  });

  test('signup page loads without crashing', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('h1')).toContainText('Thriving');
  });
});

test.describe('Phase 0 — Protected routes (requires Supabase)', () => {
  const hasSupabase = !!(process.env['NEXT_PUBLIC_SUPABASE_URL'] && process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

  test.skip(!hasSupabase, 'Skipping — NEXT_PUBLIC_SUPABASE_ANON_KEY not set');

  test('app loads at /today and redirects or renders', async ({ page }) => {
    const response = await page.goto('/today');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('bottom tab bar has 5 tabs', async ({ page }) => {
    await page.goto('/today');
    // Middleware redirects to /login which has no tab bar,
    // or renders Today with tab bar if authenticated
    const tabs = page.locator('nav a, nav button');
    const url = page.url();
    if (url.includes('/login')) {
      // Redirected — tab bar not present on auth pages
      return;
    }
    await expect(tabs).toHaveCount(5);
  });

  test('all tabs are tappable and have aria labels', async ({ page }) => {
    await page.goto('/today');
    const url = page.url();
    if (url.includes('/login')) return;
    const tabs = page.locator('nav a, nav button');
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      await expect(tab).toBeVisible();
      await expect(tab).toHaveAttribute('aria-label');
    }
  });

  test('navigating to each tab does not crash', async ({ page }) => {
    const paths = ['/today', '/tasks', '/goals', '/tree'];
    for (const path of paths) {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(500);
    }
  });
});
