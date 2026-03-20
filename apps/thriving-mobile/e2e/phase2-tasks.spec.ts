import { test, expect } from '@playwright/test';

const hasCredentials = !!(process.env['E2E_TEST_EMAIL'] && process.env['E2E_TEST_PASSWORD']);

test.describe('Phase 2 — Tasks screen', () => {
  test.skip(!hasCredentials, 'Skipping — E2E_TEST_EMAIL/PASSWORD not set');

  test('shows tasks grouped by goal', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Tasks');
    // At least one goal group should be visible (collapsible section)
    const groups = page.locator('section button:has-text("(")');
    await expect(groups.first()).toBeVisible({ timeout: 10_000 });
  });

  test('search filters tasks by title', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    // Get the first visible task title
    const firstTask = page.locator('div[role="button"] p').first();
    await expect(firstTask).toBeVisible({ timeout: 10_000 });
    const taskTitle = await firstTask.textContent();
    // Search for it
    await page.locator('input[aria-label="Search tasks"]').fill(taskTitle ?? '');
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
    // Search for nonsense — should show empty state
    await page.locator('input[aria-label="Search tasks"]').fill('zzz_nonexistent_xyz');
    await expect(page.locator('text=No tasks match your search')).toBeVisible();
  });

  test('filter chips filter by status', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    // Tap Completed filter
    await page.locator('button[role="radio"]:has-text("Completed")').click();
    // All visible tasks should have strikethrough (done status)
    const taskTexts = page.locator('div[role="button"] p');
    const count = await taskTexts.count();
    if (count > 0) {
      const first = taskTexts.first();
      const decoration = await first.evaluate((el) => getComputedStyle(el).textDecoration);
      expect(decoration).toContain('line-through');
    }
    // Tap All to reset
    await page.locator('button[role="radio"]:has-text("All")').click();
  });

  test('tap task → detail sheet opens', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    const firstTask = page.locator('div[role="button"]').first();
    await expect(firstTask).toBeVisible({ timeout: 10_000 });
    await firstTask.click();
    await expect(page.locator('text=Task Detail')).toBeVisible();
    // Close it
    await page.locator('button[aria-label="Close"]').click();
  });

  test('complete task via detail sheet → moves to completed', async ({ page }) => {
    // Create a disposable task first
    const taskName = `E2E Phase2 Complete ${Date.now()}`;
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
    await page.locator('button[aria-label="Capture"]').click();
    await page.locator('input[placeholder="What needs to be done?"]').fill(taskName);
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Add")').click();
    await expect(page.locator('input[placeholder="What needs to be done?"]')).toHaveValue('');
    await page.locator('button[aria-label="Close"]').click();

    // Go to Tasks, find it, open detail, complete it
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.locator('input[aria-label="Search tasks"]').fill(taskName);
    await expect(page.locator(`text=${taskName}`)).toBeVisible({ timeout: 10_000 });
    await page.locator(`text=${taskName}`).click();
    await expect(page.locator('text=Task Detail')).toBeVisible();
    await page.locator('button:has-text("Complete")').click();

    // Verify it appears under Completed filter
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.locator('button[role="radio"]:has-text("Completed")').click();
    await page.locator('input[aria-label="Search tasks"]').fill(taskName);
    await expect(page.locator(`text=${taskName}`)).toBeVisible({ timeout: 10_000 });
  });
});
