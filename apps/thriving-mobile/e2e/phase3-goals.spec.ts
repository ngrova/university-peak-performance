import { test, expect } from '@playwright/test';

const hasCredentials = !!(process.env['E2E_TEST_EMAIL'] && process.env['E2E_TEST_PASSWORD']);

test.describe('Phase 3 — Goals + Pillars screen', () => {
  test.skip(!hasCredentials, 'Skipping — E2E_TEST_EMAIL/PASSWORD not set');

  test('goals page shows pillar cards with progress', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Goals');
    // Pillar card should show via aria-label
    const pillarCard = page.locator('button[aria-label^="Pillar:"]').first();
    await expect(pillarCard).toBeVisible({ timeout: 10_000 });
    // Should display goal count text
    await expect(pillarCard).toContainText(/\d+ goals?/);
  });

  test('drill-down: pillar → goals → tasks → detail sheet → breadcrumb back', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');

    // Level 1: Pillar list — tap first pillar
    const firstPillar = page.locator('button[aria-label^="Pillar:"]').first();
    await expect(firstPillar).toBeVisible({ timeout: 10_000 });
    const pillarLabel = await firstPillar.getAttribute('aria-label');
    const pillarName = pillarLabel?.replace('Pillar: ', '') ?? '';
    await firstPillar.click();

    // Level 2: Goals list — verify breadcrumbs and goal cards
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible({ timeout: 5_000 });
    await expect(breadcrumb).toContainText(pillarName);
    const firstGoal = page.locator('button[aria-label^="Goal:"]').first();
    await expect(firstGoal).toBeVisible({ timeout: 10_000 });
    // Goal card should show task count
    await expect(firstGoal).toContainText(/\d+\/\d+ tasks/);
    const goalLabel = await firstGoal.getAttribute('aria-label');
    const goalTitle = goalLabel?.replace('Goal: ', '') ?? '';
    await firstGoal.click();

    // Level 3: Task list — verify breadcrumbs show goal title
    await expect(breadcrumb).toContainText(goalTitle);
    // Task rows should be visible (test account must have tasks)
    const firstTask = page.locator('div[role="button"]').first();
    await expect(firstTask).toBeVisible({ timeout: 10_000 });
    // Tap task to open detail sheet
    await firstTask.click();
    await expect(page.locator('text=Task Detail')).toBeVisible({ timeout: 3_000 });
    // Close detail sheet
    await page.locator('button[aria-label="Close"]').click();

    // Navigate back via breadcrumbs: tap pillar name
    await page.locator(`nav[aria-label="Breadcrumb"] button`).filter({ hasText: pillarName }).click();
    // Should be back at level 2 (goals visible)
    await expect(page.locator('button[aria-label^="Goal:"]').first()).toBeVisible({ timeout: 5_000 });

    // Navigate back to root: tap "Pillars" breadcrumb
    await page.locator('nav[aria-label="Breadcrumb"] button').filter({ hasText: 'Pillars' }).click();
    // Should be back at level 1 (pillar cards visible)
    await expect(page.locator('button[aria-label^="Pillar:"]').first()).toBeVisible({ timeout: 5_000 });
  });
});
