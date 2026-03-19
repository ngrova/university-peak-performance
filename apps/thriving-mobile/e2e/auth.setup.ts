import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth', 'user.json');

const hasCredentials = !!(process.env['E2E_TEST_EMAIL'] && process.env['E2E_TEST_PASSWORD']);

/** Logs in via the login page and saves auth state for other tests */
setup('authenticate', async ({ page }) => {
  setup.skip(!hasCredentials, 'Skipping — E2E_TEST_EMAIL/PASSWORD not set');

  await page.goto('/login');
  await page.locator('#login-email').fill(process.env['E2E_TEST_EMAIL']!);
  await page.locator('#login-pw').fill(process.env['E2E_TEST_PASSWORD']!);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to /today after successful login
  await page.waitForURL('**/today', { timeout: 15_000 });
  await expect(page.locator('body')).toBeVisible();

  // Save auth state (cookies + localStorage) for dependent tests
  await page.context().storageState({ path: authFile });
});
