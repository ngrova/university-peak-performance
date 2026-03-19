import { test, expect } from '@playwright/test';

const hasCredentials = !!(process.env['E2E_TEST_EMAIL'] && process.env['E2E_TEST_PASSWORD']);

test.describe('Phase 1 — Today screen', () => {
  test.skip(!hasCredentials, 'Skipping — E2E_TEST_EMAIL/PASSWORD not set');

  test('shows One Thing section and queue with real data', async ({ page }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');

    // One Thing section: either a task title or the empty state prompt
    const oneThing = page.locator('text=One Thing');
    const emptyState = page.locator('text=No One Thing yet');
    const hasOneThing = await oneThing.or(emptyState).first().isVisible();
    expect(hasOneThing).toBe(true);

    // Queue section header exists
    await expect(page.locator('text=Up Next')).toBeVisible();
  });

  test('tap task → detail sheet opens → edit title → persists', async ({ page }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');

    // Find and tap the first task row
    const firstTask = page.locator('div[role="button"]').first();
    await expect(firstTask).toBeVisible({ timeout: 10_000 });
    await firstTask.click();

    // Task detail sheet opens
    await expect(page.locator('text=Task Detail')).toBeVisible();

    // Edit the title
    const titleInput = page.locator('div.sheet-enter input:not([type="date"])').first();
    await expect(titleInput).toBeVisible();
    const original = await titleInput.inputValue();
    const edited = `${original} (edited)`;
    await titleInput.fill(edited);
    await titleInput.blur();
    await page.waitForTimeout(1000);

    // Close sheet, reload, verify title persisted
    await page.locator('div.sheet-enter button[aria-label="Close"]').click();
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${edited}`)).toBeVisible({ timeout: 10_000 });

    // Revert title
    await page.locator(`text=${edited}`).first().click();
    await expect(page.locator('text=Task Detail')).toBeVisible();
    const revert = page.locator('div.sheet-enter input:not([type="date"])').first();
    await revert.fill(original);
    await revert.blur();
    await page.waitForTimeout(1000);
  });
});
