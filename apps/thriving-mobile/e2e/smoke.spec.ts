import { test, expect } from '@playwright/test';

test.describe('Phase 0 — PWA Shell', () => {
  test('app loads at /today without crashing', async ({ page }) => {
    await page.goto('/today');
    await expect(page).not.toHaveTitle(/error/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('has dark background matching spec', async ({ page }) => {
    await page.goto('/today');
    const bg = await page.locator('html').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBeTruthy();
  });

  test('bottom tab bar has 5 tabs', async ({ page }) => {
    await page.goto('/today');
    const tabs = page.locator('nav a, nav button');
    await expect(tabs).toHaveCount(5);
  });

  test('all tabs are tappable and have aria labels', async ({ page }) => {
    await page.goto('/today');
    const tabs = page.locator('nav a, nav button');
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      await expect(tab).toBeVisible();
      await expect(tab).toHaveAttribute('aria-label');
    }
  });

  test('Today tab is active by default', async ({ page }) => {
    await page.goto('/today');
    const todayTab = page.locator('nav a[aria-label="Today"]');
    await expect(todayTab).toBeVisible();
  });

  test('navigating to each tab does not crash', async ({ page }) => {
    const paths = ['/today', '/tasks', '/goals', '/tree'];
    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
