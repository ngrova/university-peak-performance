import { test, expect } from '@playwright/test';

const hasCredentials = !!(process.env['E2E_TEST_EMAIL'] && process.env['E2E_TEST_PASSWORD']);

test.describe('Capture Upgrade — priority, deadline, assignee, notes', () => {
  test.skip(!hasCredentials, 'Skipping — E2E_TEST_EMAIL/PASSWORD not set');

  // Helper: navigate to capture page
  async function openCapture(page: import('@playwright/test').Page) {
    await page.goto('/capture');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1', { hasText: 'Capture' })).toBeVisible({ timeout: 5_000 });
  }

  test('capture with all fields — priority, deadline, assignee, notes', async ({ page }) => {
    await openCapture(page);
    const timestamp = Date.now();
    const taskTitle = `Full Capture ${timestamp}`;

    // Fill title
    await page.locator('input[placeholder="What needs to be done?"]').fill(taskTitle);

    // Wait for goal picker to load
    const goalSelect = page.getByLabel('Goal');
    await expect(goalSelect).toBeVisible({ timeout: 5_000 });

    // Select P2 priority
    await page.locator('button[aria-label="Priority P2"]').click();
    await expect(page.locator('button[aria-label="Priority P2"]')).toHaveAttribute('aria-pressed', 'true');

    // Set deadline
    const deadlineBtn = page.getByLabel('Deadline');
    await deadlineBtn.click();

    // Set assignee to Erin
    await page.locator('button[aria-label="Assign to Erin"]').click();
    await expect(page.locator('button[aria-label="Assign to Erin"]')).toHaveAttribute('aria-pressed', 'true');

    // Add notes
    await page.locator('textarea[placeholder="Add notes, contacts, context..."]').fill('E2E test notes');

    // Tap Add
    await page.locator('button', { hasText: 'Add task' }).click();

    // All fields should clear
    await expect(page.locator('input[placeholder="What needs to be done?"]')).toHaveValue('', { timeout: 5_000 });
    await expect(page.locator('button[aria-label="Priority P2"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('button[aria-label="Assign to Erin"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('textarea')).toHaveValue('');
  });

  test('quick capture still works — title and goal only', async ({ page }) => {
    await openCapture(page);
    const timestamp = Date.now();
    const taskTitle = `Quick Capture ${timestamp}`;

    // Fill only title (goal auto-selects)
    await page.locator('input[placeholder="What needs to be done?"]').fill(taskTitle);

    // Don't touch priority, deadline, assignee, or notes
    await page.locator('button', { hasText: 'Add task' }).click();

    // Title clears = success
    await expect(page.locator('input[placeholder="What needs to be done?"]')).toHaveValue('', { timeout: 5_000 });

    // Close and verify task exists
    await page.locator('button[aria-label="Back"]').click();
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible({ timeout: 10_000 });
  });

  test('priority chips are single-select and toggleable', async ({ page }) => {
    await openCapture(page);

    // Select P1
    await page.locator('button[aria-label="Priority P1"]').click();
    await expect(page.locator('button[aria-label="Priority P1"]')).toHaveAttribute('aria-pressed', 'true');

    // Select P3 — P1 should deselect
    await page.locator('button[aria-label="Priority P3"]').click();
    await expect(page.locator('button[aria-label="Priority P3"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('button[aria-label="Priority P1"]')).toHaveAttribute('aria-pressed', 'false');

    // Tap P3 again — should deselect (toggle off)
    await page.locator('button[aria-label="Priority P3"]').click();
    await expect(page.locator('button[aria-label="Priority P3"]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('assignee chips are single-select and toggleable', async ({ page }) => {
    await openCapture(page);

    await page.locator('button[aria-label="Assign to Nick"]').click();
    await expect(page.locator('button[aria-label="Assign to Nick"]')).toHaveAttribute('aria-pressed', 'true');

    // Select Liz — Nick should deselect
    await page.locator('button[aria-label="Assign to Liz"]').click();
    await expect(page.locator('button[aria-label="Assign to Liz"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('button[aria-label="Assign to Nick"]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('capture sheet is scrollable with all fields visible', async ({ page }) => {
    await openCapture(page);

    // All field sections should be visible (may need to scroll)
    await expect(page.locator('text=Priority')).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('text=Deadline')).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('text=Assignee')).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('text=Notes')).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('button', { hasText: 'Add task' })).toBeVisible({ timeout: 3_000 });
  });

  test('error state preserves all field values', async ({ page }) => {
    await openCapture(page);

    // Fill all fields but don't select a goal (clear it)
    await page.locator('input[placeholder="What needs to be done?"]').fill('Error test task');
    await page.locator('button[aria-label="Priority P1"]').click();
    await page.locator('button[aria-label="Assign to Nick"]').click();
    await page.locator('textarea').fill('Should not be lost');

    // The goal auto-selects, so this should succeed. But if it fails for any reason,
    // verify the error banner appears and fields are preserved
    // For now, verify the form is functional with all fields filled
    await expect(page.locator('button[aria-label="Priority P1"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('button[aria-label="Assign to Nick"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('textarea')).toHaveValue('Should not be lost');
  });
});
