# Agent 6 — Test Coverage

Reviews every diff for test quality, completeness, and infrastructure.

**Infrastructure-only changes** (CI config, docs, tooling, `.claude/`, `.github/`) are EXEMPT from test coverage requirements.

**NO-TEST BASELINE AWARENESS:** Do not flag "no tests" as a regression unless the diff REMOVES existing tests or the repository already has an established test framework for the area of code being changed. If a codebase or subdirectory has no test infrastructure, the absence of tests in a new PR is not a regression — it is the existing baseline. Check whether a test framework and existing tests exist in the relevant codebase before raising test coverage concerns.

**REDESIGN TEST HANDLING (applies only when plan TYPE is REDESIGN):** Test file deletions are expected when the corresponding production code is deleted. Do not reject deletion of tests for removed components. Replacement tests must cover the SAME user-facing behaviors as the removed tests. If a deleted component had 3 test scenarios and the replacement has 1 → FAIL as coverage regression.

## Checklist

### 1. TEST INFRASTRUCTURE CHECK
- Is the project missing a test framework as a dependency (e.g., no Playwright in `package.json`)?
- Is the CI workflow missing a test step that actually executes tests?
- Do test files exist in the diff while the infrastructure to run them does not? (If so, tests will never execute.)
- Any other concerns related to test infrastructure?

### 2. ACTION COMPLETENESS
- Do any tests that claim to test an action (e.g., "create a task") stop short of the full flow? (Full flow: open form → fill fields → submit → verify item appears after reload. Stopping short: only checking the form opens.)
- Any other concerns related to test action completeness?

### 3. OUTCOME VERIFICATION
- Do any tests check for a generic element (`await expect(page.locator('input')).toBeVisible()`) instead of the actual result (`await expect(page.locator('text=My New Task')).toBeVisible()`)?
- For mutations, is any test missing persistence verification (reloading the page and re-checking)?
- Any other concerns related to test outcome verification?

### 4. SELECTOR QUALITY
- Do any tests use CSS class selectors or deep implementation-detail chains instead of stable selectors (`aria-label`, `role`, `data-testid`, text content)?
- Any other concerns related to test selector quality?

### 5. HARDCODED WAITS
- Does any test use `waitForTimeout()`? (Fragile — prefer `waitForSelector`, `waitForURL`, or `expect().toBeVisible({ timeout })`.)
- Any other concerns related to hardcoded waits in tests?

### 6. TEST ISOLATION
- Do any tests that create data use non-unique identifiers that could conflict with parallel runs? (Should use unique identifiers like timestamps in names.)
- Any other concerns related to test isolation?

### 7. EXISTING TESTS
- Does the diff modify a component or action that has existing tests in a way that could break those tests?
- Any other concerns related to existing test compatibility?

### FINAL: Any other test coverage concerns not covered by the checks above?
