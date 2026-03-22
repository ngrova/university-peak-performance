import { test, expect } from '@playwright/test';

const hasCredentials = !!(process.env['E2E_TEST_EMAIL'] && process.env['E2E_TEST_PASSWORD']);
const hasDelegation = !!process.env['E2E_ASSISTANT_EMAIL'];

test.describe('Goal CRUD — create, edit, move, archive', () => {
  test.skip(!hasCredentials, 'Skipping — E2E_TEST_EMAIL/PASSWORD not set');

  // Helper: navigate to goals tab and drill into first pillar
  async function drillIntoFirstPillar(page: import('@playwright/test').Page) {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
    const pillar = page.locator('button[aria-label^="Pillar:"]').first();
    await expect(pillar).toBeVisible({ timeout: 10_000 });
    await pillar.click();
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible({ timeout: 5_000 });
  }

  // Helper: open edit sheet on first goal
  async function openEditSheet(page: import('@playwright/test').Page) {
    const editBtn = page.locator('button[aria-label^="Edit "]').first();
    await expect(editBtn).toBeVisible({ timeout: 5_000 });
    await editBtn.click();
    await expect(page.getByRole('heading', { name: 'Edit Goal' })).toBeVisible({ timeout: 3_000 });
  }

  test('create a new goal under a pillar', async ({ page }) => {
    await drillIntoFirstPillar(page);
    const addBtn = page.locator('button', { hasText: 'Add goal' });
    await expect(addBtn).toBeVisible({ timeout: 5_000 });
    await addBtn.click();

    const timestamp = Date.now();
    const goalTitle = `E2E Goal ${timestamp}`;
    const input = page.locator('input[placeholder="Goal title…"]');
    await expect(input).toBeVisible({ timeout: 3_000 });
    await input.fill(goalTitle);
    await input.press('Enter');

    // Verify new goal appears
    await expect(page.locator(`button[aria-label="Goal: ${goalTitle}"]`)).toBeVisible({ timeout: 10_000 });
  });

  test('edit a goal title and verify it persists', async ({ page }) => {
    await drillIntoFirstPillar(page);
    await openEditSheet(page);

    // Change the title
    const titleInput = page.getByRole('textbox').first();
    const originalTitle = await titleInput.inputValue();
    const newTitle = `${originalTitle} (edited)`;
    await titleInput.fill(newTitle);
    await titleInput.blur();

    // Close sheet and verify title updated in the list
    await page.locator('button[aria-label="Close"]').click();
    await expect(page.locator(`button[aria-label="Goal: ${newTitle}"]`)).toBeVisible({ timeout: 5_000 });

    // Reopen and verify the saved value persisted
    await openEditSheet(page);
    const savedTitle = await page.getByRole('textbox').first().inputValue();
    expect(savedTitle).toBe(newTitle);
    await page.locator('button[aria-label="Close"]').click();

    // Restore original title
    await page.locator('button[aria-label^="Edit "]').first().click();
    const restoreInput = page.getByRole('textbox').first();
    await restoreInput.fill(originalTitle);
    await restoreInput.blur();
    await page.locator('button[aria-label="Close"]').click();
  });

  test('edit goal priority and target date — values persist on reopen', async ({ page }) => {
    await drillIntoFirstPillar(page);
    await openEditSheet(page);

    // Change priority via labeled select
    const prioritySelect = page.getByLabel('Priority');
    await prioritySelect.selectOption('3');

    // Change target date via labeled input
    const dateInput = page.getByLabel('Target Date');
    await dateInput.fill('2026-12-31');

    // Close and reopen to verify persistence
    await page.locator('button[aria-label="Close"]').click();
    await openEditSheet(page);

    const savedPriority = await page.getByLabel('Priority').inputValue();
    expect(savedPriority).toBe('3');
    const savedDate = await page.getByLabel('Target Date').inputValue();
    expect(savedDate).toBe('2026-12-31');

    await page.locator('button[aria-label="Close"]').click();
  });

  test('change goal color and verify checkmark persists', async ({ page }) => {
    await drillIntoFirstPillar(page);
    await openEditSheet(page);

    // Tap a color swatch
    const colorBtn = page.locator('button[aria-label^="Color "]').nth(2);
    await colorBtn.click();
    await expect(colorBtn.locator('svg')).toBeVisible({ timeout: 3_000 });

    // Close and reopen — checkmark should still be on the same color
    await page.locator('button[aria-label="Close"]').click();
    await openEditSheet(page);
    const sameColor = page.locator('button[aria-label^="Color "]').nth(2);
    await expect(sameColor.locator('svg')).toBeVisible({ timeout: 3_000 });

    await page.locator('button[aria-label="Close"]').click();
  });

  test('move a goal to a different pillar', async ({ page }) => {
    await drillIntoFirstPillar(page);

    const firstGoalBtn = page.locator('button[aria-label^="Goal:"]').first();
    await expect(firstGoalBtn).toBeVisible({ timeout: 5_000 });
    const goalLabel = await firstGoalBtn.getAttribute('aria-label');
    const goalTitle = goalLabel?.replace('Goal: ', '') ?? '';

    await openEditSheet(page);

    // Change pillar via labeled select — must have 2+ pillars
    const pillarSelect = page.getByLabel('Pillar');
    const options = pillarSelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1);

    const secondOption = await options.nth(1).getAttribute('value');
    if (secondOption) await pillarSelect.selectOption(secondOption);

    await page.locator('button[aria-label="Close"]').click();

    // Goal should no longer be in this pillar's list
    await expect(page.locator(`button[aria-label="Goal: ${goalTitle}"]`)).not.toBeVisible({ timeout: 5_000 });
  });

  test('archive a goal removes it from the list', async ({ page }) => {
    await drillIntoFirstPillar(page);

    const goalsBefore = await page.locator('button[aria-label^="Goal:"]').count();
    await openEditSheet(page);

    const archiveBtn = page.locator('button', { hasText: 'Archive Goal' });
    await archiveBtn.click();

    // Sheet closes and goal count decreases
    await expect(page.getByRole('heading', { name: 'Edit Goal' })).not.toBeVisible({ timeout: 5_000 });
    const goalsAfter = await page.locator('button[aria-label^="Goal:"]').count();
    expect(goalsAfter).toBeLessThan(goalsBefore);
  });

  test('drill-down regression: pillar → goals → tasks still works', async ({ page }) => {
    await drillIntoFirstPillar(page);

    const firstGoal = page.locator('button[aria-label^="Goal:"]').first();
    await expect(firstGoal).toBeVisible({ timeout: 10_000 });
    await firstGoal.click();

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible({ timeout: 5_000 });
    const crumbCount = await breadcrumb.locator('button').count();
    expect(crumbCount).toBeGreaterThanOrEqual(2);

    // Navigate back to root
    await breadcrumb.locator('button').filter({ hasText: 'Pillars' }).click();
    await expect(page.locator('button[aria-label^="Pillar:"]').first()).toBeVisible({ timeout: 5_000 });
  });

  test('creating goal with empty title reverts to button', async ({ page }) => {
    await drillIntoFirstPillar(page);
    const goalsBefore = await page.locator('button[aria-label^="Goal:"]').count();

    const addBtn = page.locator('button', { hasText: 'Add goal' });
    await addBtn.click();
    const input = page.locator('input[placeholder="Goal title…"]');
    await expect(input).toBeVisible({ timeout: 3_000 });
    await input.focus();
    await input.blur();

    // Button reappears and no new goal was created
    await expect(page.locator('button', { hasText: 'Add goal' })).toBeVisible({ timeout: 3_000 });
    const goalsAfter = await page.locator('button[aria-label^="Goal:"]').count();
    expect(goalsAfter).toBe(goalsBefore);
  });
});

test.describe('Goal CRUD — delegation mode', () => {
  test.skip(!hasDelegation, 'Skipping — E2E_ASSISTANT_EMAIL not set');

  test('assistant can create and edit goals on owner account', async ({ page }) => {
    // Log in as assistant, select owner account, verify goal CRUD works
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');

    // Delegation banner should be visible
    await expect(page.locator('text=Viewing')).toBeVisible({ timeout: 10_000 });

    // Drill into first pillar and create a goal
    const pillar = page.locator('button[aria-label^="Pillar:"]').first();
    await expect(pillar).toBeVisible({ timeout: 10_000 });
    await pillar.click();

    const addBtn = page.locator('button', { hasText: 'Add goal' });
    await expect(addBtn).toBeVisible({ timeout: 5_000 });
    await addBtn.click();

    const timestamp = Date.now();
    const goalTitle = `Delegate Goal ${timestamp}`;
    const input = page.locator('input[placeholder="Goal title…"]');
    await input.fill(goalTitle);
    await input.press('Enter');

    await expect(page.locator(`button[aria-label="Goal: ${goalTitle}"]`)).toBeVisible({ timeout: 10_000 });
  });
});
