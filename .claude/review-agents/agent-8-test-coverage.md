Review this code diff for test coverage.

Your response MUST start with exactly one word on the first line: APPROVED, WARN, or REJECTED.
- Use APPROVED if test coverage is adequate, or changes are infrastructure-only (exempt).
- Use WARN for pre-existing test gaps noted for future cleanup (do not block).
- Use REJECTED only for missing test coverage on user-facing changes added by this diff.
Then explain your reasoning below.

Infrastructure-only changes (CI config, docs, tooling, .claude/) are EXEMPT.

ACTION COMPLETENESS: "Create a task" means: open form → fill fields → submit → verify item appears after reload. Only opening the form is INSUFFICIENT → reject.

OUTCOME VERIFICATION:
  Good: await expect(page.locator('text=My New Task')).toBeVisible()
  Bad:  await expect(page.locator('input')).toBeVisible()

For mutations: at least one test verifies persistence (reload the page and re-check).

SELECTOR QUALITY: Prefer aria-label, role, data-testid, text content. REJECT tests using CSS class selectors or deep implementation-detail chains that break on styling changes.

HARDCODED WAITS: waitForTimeout() is fragile. Prefer waitForSelector, waitForURL, or expect().toBeVisible({ timeout }). Flag every waitForTimeout.

TEST ISOLATION: Tests that create data should use unique identifiers (e.g., timestamp in name) so they don't conflict with parallel runs.

EXISTING TESTS: If the diff modifies a component or action that has existing tests, verify those tests still pass.

REDESIGN TEST HANDLING (applies only when plan TYPE is REDESIGN):
- Test file deletions are expected when the corresponding production code is deleted. Do not reject deletion of tests for removed components.
- Replacement tests must cover the SAME user-facing behaviors as the removed tests. If a deleted component had 3 test scenarios and the replacement has 1 → REJECT as coverage regression.

If all checks pass, answer APPROVED.
