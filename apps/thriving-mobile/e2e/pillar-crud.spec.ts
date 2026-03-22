import { test, expect } from '@playwright/test';

const hasCredentials = !!(process.env['E2E_TEST_EMAIL'] && process.env['E2E_TEST_PASSWORD']);
const hasDelegation = !!process.env['E2E_ASSISTANT_EMAIL'];

test.describe('Pillar CRUD — create, edit, reorder, archive', () => {
  test.skip(!hasCredentials, 'Skipping — E2E_TEST_EMAIL/PASSWORD not set');

  // Helper: open edit sheet on first pillar
  async function openEditSheet(page: import('@playwright/test').Page) {
    const editBtn = page.locator('button[aria-label^="Edit "]').first();
    await expect(editBtn).toBeVisible({ timeout: 5_000 });
    await editBtn.click();
    await expect(page.getByRole('heading', { name: 'Edit Pillar' })).toBeVisible({ timeout: 3_000 });
  }

  test('create a new pillar', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');

    const addBtn = page.locator('button', { hasText: 'Add pillar' });
    await expect(addBtn).toBeVisible({ timeout: 5_000 });
    await addBtn.click();

    const timestamp = Date.now();
    const pillarName = `E2E Pillar ${timestamp}`;
    const input = page.locator('input[placeholder="Pillar name…"]');
    await expect(input).toBeVisible({ timeout: 3_000 });
    await input.fill(pillarName);
    await input.press('Enter');

    // Verify new pillar appears
    await expect(page.locator(`button[aria-label="Pillar: ${pillarName}"]`)).toBeVisible({ timeout: 10_000 });
  });

  test('edit a pillar name and verify it persists', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button[aria-label^="Pillar:"]').first()).toBeVisible({ timeout: 10_000 });
    await openEditSheet(page);

    // Change the name
    const nameInput = page.getByLabel('Pillar name');
    const originalName = await nameInput.inputValue();
    const newName = `${originalName} (edited)`;
    await nameInput.fill(newName);
    await nameInput.blur();

    // Close and verify in list
    await page.locator('button[aria-label="Close"]').click();
    await expect(page.locator(`button[aria-label="Pillar: ${newName}"]`)).toBeVisible({ timeout: 5_000 });

    // Reopen and verify persistence
    await openEditSheet(page);
    const savedName = await page.getByLabel('Pillar name').inputValue();
    expect(savedName).toBe(newName);
    await page.locator('button[aria-label="Close"]').click();

    // Restore original name
    await page.locator('button[aria-label^="Edit "]').first().click();
    const restoreInput = page.getByLabel('Pillar name');
    await restoreInput.fill(originalName);
    await restoreInput.blur();
    await page.locator('button[aria-label="Close"]').click();
  });

  test('edit pillar icon and verify it persists', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button[aria-label^="Pillar:"]').first()).toBeVisible({ timeout: 10_000 });
    await openEditSheet(page);

    const iconInput = page.getByLabel('Icon');
    await iconInput.fill('🚀');
    await iconInput.blur();

    // Close and reopen to verify
    await page.locator('button[aria-label="Close"]').click();
    await openEditSheet(page);
    const savedIcon = await page.getByLabel('Icon').inputValue();
    expect(savedIcon).toBe('🚀');
    await page.locator('button[aria-label="Close"]').click();
  });

  test('change pillar color via color picker', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button[aria-label^="Pillar:"]').first()).toBeVisible({ timeout: 10_000 });
    await openEditSheet(page);

    const colorBtn = page.locator('button[aria-label^="Color "]').nth(3);
    await colorBtn.click();
    await expect(colorBtn.locator('svg')).toBeVisible({ timeout: 3_000 });

    // Close and reopen to verify persistence
    await page.locator('button[aria-label="Close"]').click();
    await openEditSheet(page);
    const sameColor = page.locator('button[aria-label^="Color "]').nth(3);
    await expect(sameColor.locator('svg')).toBeVisible({ timeout: 3_000 });
    await page.locator('button[aria-label="Close"]').click();
  });

  test('reorder pillar via move down button', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
    const pillars = page.locator('button[aria-label^="Pillar:"]');
    const pillarCount = await pillars.count();
    test.skip(pillarCount < 2, 'Need 2+ pillars to test reorder');

    // Get first pillar's name
    const firstLabel = await pillars.first().getAttribute('aria-label');
    const firstName = firstLabel?.replace('Pillar: ', '') ?? '';

    // Open edit sheet on first pillar and move down
    await openEditSheet(page);
    await page.locator('button[aria-label="Move down"]').click();
    await page.locator('button[aria-label="Close"]').click();

    // First pillar should now be second
    await page.waitForLoadState('networkidle');
    const newFirstLabel = await pillars.first().getAttribute('aria-label');
    const newFirstName = newFirstLabel?.replace('Pillar: ', '') ?? '';
    expect(newFirstName).not.toBe(firstName);

    // Move it back up to restore order
    const secondPillar = pillars.nth(1);
    const secondEditBtn = secondPillar.locator('..').locator('button[aria-label^="Edit "]');
    await secondEditBtn.click();
    await expect(page.getByRole('heading', { name: 'Edit Pillar' })).toBeVisible({ timeout: 3_000 });
    await page.locator('button[aria-label="Move up"]').click();
    await page.locator('button[aria-label="Close"]').click();
  });

  test('archive a pillar removes it from the list', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');

    const pillarsBefore = await page.locator('button[aria-label^="Pillar:"]').count();
    await openEditSheet(page);

    const archiveBtn = page.locator('button', { hasText: 'Archive Pillar' });
    await archiveBtn.click();

    // Sheet closes and pillar count decreases
    await expect(page.getByRole('heading', { name: 'Edit Pillar' })).not.toBeVisible({ timeout: 5_000 });
    const pillarsAfter = await page.locator('button[aria-label^="Pillar:"]').count();
    expect(pillarsAfter).toBeLessThan(pillarsBefore);
  });

  test('drill-down regression: pillar → goals still works after pillar CRUD', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');

    const firstPillar = page.locator('button[aria-label^="Pillar:"]').first();
    await expect(firstPillar).toBeVisible({ timeout: 10_000 });
    await firstPillar.click();

    // Should see breadcrumbs (level 2)
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible({ timeout: 5_000 });

    // Navigate back
    await breadcrumb.locator('button').filter({ hasText: 'Pillars' }).click();
    await expect(page.locator('button[aria-label^="Pillar:"]').first()).toBeVisible({ timeout: 5_000 });
  });

  test('creating pillar with empty name reverts to button', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
    const pillarsBefore = await page.locator('button[aria-label^="Pillar:"]').count();

    const addBtn = page.locator('button', { hasText: 'Add pillar' });
    await addBtn.click();
    const input = page.locator('input[placeholder="Pillar name…"]');
    await expect(input).toBeVisible({ timeout: 3_000 });
    await input.focus();
    await input.blur();

    // Button reappears and no pillar created
    await expect(page.locator('button', { hasText: 'Add pillar' })).toBeVisible({ timeout: 3_000 });
    const pillarsAfter = await page.locator('button[aria-label^="Pillar:"]').count();
    expect(pillarsAfter).toBe(pillarsBefore);
  });
});

test.describe('Pillar CRUD — delegation mode', () => {
  test.skip(!hasDelegation, 'Skipping — E2E_ASSISTANT_EMAIL not set');

  test('assistant can create and edit pillars on owner account', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');

    // Delegation banner should be visible
    await expect(page.locator('text=Viewing')).toBeVisible({ timeout: 10_000 });

    // Create a pillar
    const addBtn = page.locator('button', { hasText: 'Add pillar' });
    await expect(addBtn).toBeVisible({ timeout: 5_000 });
    await addBtn.click();

    const timestamp = Date.now();
    const pillarName = `Delegate Pillar ${timestamp}`;
    const input = page.locator('input[placeholder="Pillar name…"]');
    await input.fill(pillarName);
    await input.press('Enter');

    await expect(page.locator(`button[aria-label="Pillar: ${pillarName}"]`)).toBeVisible({ timeout: 10_000 });
  });
});
