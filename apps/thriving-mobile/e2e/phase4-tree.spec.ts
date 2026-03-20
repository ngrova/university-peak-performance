import { test, expect } from '@playwright/test';

const hasCredentials = !!(process.env['E2E_TEST_EMAIL'] && process.env['E2E_TEST_PASSWORD']);

test.describe('Phase 4 — Domino Tree screen', () => {
  test.skip(!hasCredentials, 'Skipping — E2E_TEST_EMAIL/PASSWORD not set');

  test('tree page shows pillar nodes with progress rings', async ({ page }) => {
    await page.goto('/tree');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Tree');
    const pillarNode = page.locator('button[aria-label^="Pillar:"]').first();
    await expect(pillarNode).toBeVisible({ timeout: 10_000 });
  });

  test('drill-down: pillar → goals → task chain → detail sheet → breadcrumb back', async ({ page }) => {
    await page.goto('/tree');
    await page.waitForLoadState('networkidle');

    // Level 1: Pillar Map — tap first pillar
    const firstPillar = page.locator('button[aria-label^="Pillar:"]').first();
    await expect(firstPillar).toBeVisible({ timeout: 10_000 });
    const pillarLabel = await firstPillar.getAttribute('aria-label');
    const pillarName = pillarLabel?.replace('Pillar: ', '') ?? '';
    await firstPillar.click();

    // Level 2: Goal Clusters — verify breadcrumbs show pillar name
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible({ timeout: 5_000 });
    await expect(breadcrumb).toContainText(pillarName);
    const firstGoal = page.locator('button[aria-label^="Goal:"]').first();
    await expect(firstGoal).toBeVisible({ timeout: 10_000 });
    const goalLabel = await firstGoal.getAttribute('aria-label');
    const goalTitle = goalLabel?.replace('Goal: ', '') ?? '';
    await firstGoal.click();

    // Level 3: Task Chain — verify breadcrumbs show goal title
    await expect(breadcrumb).toContainText(goalTitle);
    const firstTask = page.locator('button[aria-label^="Task:"]').first();
    await expect(firstTask).toBeVisible({ timeout: 10_000 });
    // Tap task to open detail sheet
    await firstTask.click();
    await expect(page.locator('text=Task Detail')).toBeVisible({ timeout: 3_000 });
    await page.locator('button[aria-label="Close"]').click();

    // Breadcrumb back to Level 2
    await page.locator('nav[aria-label="Breadcrumb"] button').filter({ hasText: pillarName }).click();
    await expect(page.locator('button[aria-label^="Goal:"]').first()).toBeVisible({ timeout: 5_000 });

    // Breadcrumb back to Level 1
    await page.locator('nav[aria-label="Breadcrumb"] button').filter({ hasText: 'Tree' }).click();
    await expect(page.locator('button[aria-label^="Pillar:"]').first()).toBeVisible({ timeout: 5_000 });
  });

  test('fork node shows parallel tracks when present', async ({ page }) => {
    await page.goto('/tree');
    await page.waitForLoadState('networkidle');
    // Navigate to a task chain
    const pillar = page.locator('button[aria-label^="Pillar:"]').first();
    await expect(pillar).toBeVisible({ timeout: 10_000 });
    await pillar.click();
    const goal = page.locator('button[aria-label^="Goal:"]').first();
    await expect(goal).toBeVisible({ timeout: 10_000 });
    await goal.click();
    // Check if a fork node exists (conditional — depends on test data)
    const forkNode = page.locator('button[aria-label^="Fork:"]');
    const hasFork = await forkNode.first().isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasFork) {
      await forkNode.first().click();
      const trackRow = page.locator('button[aria-label^="Track:"]').first();
      await expect(trackRow).toBeVisible({ timeout: 5_000 });
    }
  });
});
