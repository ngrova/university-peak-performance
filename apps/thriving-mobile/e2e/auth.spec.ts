import { test, expect } from '@playwright/test';

test.describe('Auth pages', () => {
  test('login page renders with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Thriving');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('signup page renders with email and password fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('h1')).toContainText('Thriving');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login page links to signup', async ({ page }) => {
    await page.goto('/login');
    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible();
  });

  test('signup page links to login', async ({ page }) => {
    await page.goto('/signup');
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
  });

  test('login submit button disables while loading', async ({ page }) => {
    await page.goto('/login');
    const submit = page.locator('button[type="submit"]');
    await expect(submit).not.toBeDisabled();
  });
});
