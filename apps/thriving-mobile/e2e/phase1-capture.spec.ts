import { test, expect } from '@playwright/test';

const hasCredentials = !!(process.env['E2E_TEST_EMAIL'] && process.env['E2E_TEST_PASSWORD']);

test.describe('Phase 1 — Capture + Complete', () => {
  test.skip(!hasCredentials, 'Skipping — E2E_TEST_EMAIL/PASSWORD not set');

  test('capture: tap +, type title, pick goal, Add → task appears', async ({ page }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
    const taskName = `E2E Capture ${Date.now()}`;

    // Open capture sheet via + button
    await page.locator('button[aria-label="Capture"]').click();
    await expect(page.locator('text=Capture')).toBeVisible();

    // Fill title
    const titleInput = page.locator('input[placeholder="What needs to be done?"]');
    await titleInput.fill(taskName);

    // Wait for goal picker to load
    const goalSelect = page.locator('select[aria-label="Goal"]');
    await page.waitForTimeout(1000);
    const selectedGoal = await goalSelect.inputValue();
    expect(selectedGoal).toBeTruthy();

    // Tap Add and verify input clears (rapid capture mode)
    await page.locator('button:has-text("Add")').click();
    await expect(titleInput).toHaveValue('', { timeout: 5_000 });

    // Close sheet
    await page.locator('button[aria-label="Close"]').click();

    // Reload and verify task appears in queue
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${taskName}`)).toBeVisible({ timeout: 10_000 });
  });

  test('complete: swipe right on task → disappears from queue', async ({ page }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');

    // Create a disposable task to complete
    const taskName = `E2E Complete ${Date.now()}`;
    await page.locator('button[aria-label="Capture"]').click();
    await page.locator('input[placeholder="What needs to be done?"]').fill(taskName);
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Add")').click();
    await expect(page.locator('input[placeholder="What needs to be done?"]')).toHaveValue('');
    await page.locator('button[aria-label="Close"]').click();

    // Reload to see the task
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
    const taskRow = page.locator(`text=${taskName}`).first();
    await expect(taskRow).toBeVisible({ timeout: 10_000 });

    // Swipe right via touch events
    const box = await taskRow.boundingBox();
    if (box) {
      const y = box.y + box.height / 2;
      await page.dispatchEvent(`text=${taskName}`, 'touchstart', {
        touches: [{ clientX: box.x + 20, clientY: y }],
      });
      await page.dispatchEvent(`text=${taskName}`, 'touchend', {
        changedTouches: [{ clientX: box.x + 120, clientY: y }],
      });
    }
    await page.waitForTimeout(2000);

    // Reload and verify task is gone
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${taskName}`)).not.toBeVisible({ timeout: 5_000 });
  });
});
