import { test, expect } from '@playwright/test';

const hasCredentials = !!(process.env['E2E_TEST_EMAIL'] && process.env['E2E_TEST_PASSWORD']);
const hasAIKey = !!process.env['ANTHROPIC_API_KEY'];

test.describe('Capture Layer 3 — Voice, Camera, AI', () => {
  test.skip(!hasCredentials, 'Skipping — E2E_TEST_EMAIL/PASSWORD not set');

  // Helper: navigate to capture page
  async function openCapture(page: import('@playwright/test').Page) {
    await page.goto('/capture');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1', { hasText: 'Capture' })).toBeVisible({ timeout: 5_000 });
  }

  test('voice and scan buttons are visible in capture sheet', async ({ page }) => {
    await openCapture(page);

    // Voice button should be visible
    const voiceBtn = page.locator('button[aria-label="Start recording"]');
    await expect(voiceBtn).toBeVisible({ timeout: 3_000 });

    // Scan button should be visible
    const scanBtn = page.locator('button[aria-label="Take photo"]');
    await expect(scanBtn).toBeVisible({ timeout: 3_000 });
  });

  test('photo capture via file input creates a thumbnail', async ({ page }) => {
    await openCapture(page);

    // Set a file on the hidden file input (simulates camera capture)
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await fileInput.setInputFiles({
      name: 'test-photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });

    // A photo thumbnail should appear
    await expect(page.locator('img[alt="Captured"]')).toBeVisible({ timeout: 5_000 });

    // Process with AI button should appear (we have media)
    await expect(page.locator('button[aria-label="Process with AI"]')).toBeVisible({ timeout: 3_000 });
  });

  test('multiple photos show as horizontal thumbnails with remove', async ({ page }) => {
    await openCapture(page);

    const fileInput = page.locator('input[type="file"][accept="image/*"]');

    // Add first photo
    await fileInput.setInputFiles({ name: 'photo1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('img1') });
    await expect(page.locator('img[alt="Captured"]')).toHaveCount(1, { timeout: 5_000 });

    // Add second photo
    await fileInput.setInputFiles({ name: 'photo2.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('img2') });
    await expect(page.locator('img[alt="Captured"]')).toHaveCount(2, { timeout: 5_000 });

    // Remove first photo
    const removeBtn = page.locator('button[aria-label="Remove photo"]').first();
    await removeBtn.click();
    await expect(page.locator('img[alt="Captured"]')).toHaveCount(1, { timeout: 3_000 });
  });

  test('process with AI button shows processing state', async ({ page }) => {
    test.skip(!hasAIKey, 'Skipping — ANTHROPIC_API_KEY not set');
    await openCapture(page);

    // Add a photo to enable the Process button
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await fileInput.setInputFiles({ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('test') });

    // Tap Process with AI
    const processBtn = page.locator('button[aria-label="Process with AI"]');
    await expect(processBtn).toBeVisible({ timeout: 3_000 });
    await processBtn.click();

    // Should show processing state
    await expect(processBtn).toContainText('Processing', { timeout: 3_000 });
  });

  test('existing capture fields still work alongside media section', async ({ page }) => {
    await openCapture(page);

    // All existing fields should be visible
    await expect(page.locator('input[placeholder="What needs to be done?"]')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByLabel('Goal')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('button[aria-label="Priority P1"]')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByLabel('Deadline')).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('button[aria-label="Assign to Nick"]')).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('textarea')).toBeVisible({ timeout: 3_000 });

    // Quick capture still works (title only)
    const timestamp = Date.now();
    await page.locator('input[placeholder="What needs to be done?"]').fill(`AI Test ${timestamp}`);
    await page.locator('button', { hasText: 'Add task' }).click();
    await expect(page.locator('input[placeholder="What needs to be done?"]')).toHaveValue('', { timeout: 5_000 });
  });

  test('no process button when no media is captured', async ({ page }) => {
    await openCapture(page);

    // Process button should NOT be visible without media
    await expect(page.locator('button[aria-label="Process with AI"]')).not.toBeVisible();
  });
});
