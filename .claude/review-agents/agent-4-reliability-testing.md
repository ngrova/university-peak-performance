Review this code diff for reliability, silent failure risks, and test coverage.

Your response MUST start with exactly one word on the first line: APPROVED, WARN, or REJECTED.
- Use APPROVED if test coverage is adequate and no silent failure risks exist, or changes are infrastructure-only (exempt).
- Use WARN for pre-existing issues noted for future cleanup (do not block).
- Use REJECTED only for issues in lines the PR author actually added.
Then explain your reasoning below.

Infrastructure-only changes (CI config, docs, tooling, .claude/, .github/) are EXEMPT from test coverage requirements.

CODEBASE CONTEXT: This monorepo contains multiple codebases with different reliability patterns. Before applying rules, check the file paths in the diff to determine which codebase each file belongs to, and apply the correct rules per-file.

If the diff contains files in `fleet-sync-server/`:
- No Sentry — do not reject for missing captureException in catch blocks. Errors are returned as JSON-RPC error responses.
- Catch blocks must still handle errors (not empty catch {}) — but the error handling pattern is returning a JSON-RPC error response, not calling Sentry.
- Supabase error handling rules (destructure and check error) still apply.
- Testing: fleet-sync-server uses unit tests (Vitest), not Playwright E2E tests. Do not reject for missing E2E tests on fleet-sync-server code.
- All other silent failure detection rules still apply.

If the diff contains files in `apps/thriving-mobile/`:
- All existing rules apply as-is with no modifications.

A PR may touch both codebases — apply the correct rules per-file based on its path.

PART A — SILENT FAILURE DETECTION

1. CATCH BLOCK AUDIT
   - Every catch block in a server action or API route MUST log the error (Sentry captureException or structured logger) BEFORE returning a user-facing message.
     Bad:  catch { return { error: 'Failed to save' } }
     Good: catch (err) { captureException(err); return { error: 'Failed to save — try again' } }
   - catch {} (empty catch, no parameter) → ALWAYS REJECT.
   - catch blocks that return [] or null without logging → REJECT. These hide data-fetching failures as "no data."

2. EMPTY RETURN ANALYSIS
   - If a function returns [] or null in BOTH the "not authenticated" path AND the catch path, the caller CANNOT distinguish "no data" from "fetch failed." REJECT unless the error path logs before returning.

3. SUPABASE ERROR HANDLING
   - After every Supabase query: const { data, error } = await supabase.from(...)
     If error is not destructured → REJECT (errors silently ignored).
     If error is destructured but not checked (no if (error)) → REJECT.

4. MUTATION FEEDBACK
   - After a mutation, the user must see confirmation it worked. If a mutation's success path and error path return the same shape (both return {}), the UI cannot distinguish success from failure → flag it.
   - No "success" UI (toast, modal close, optimistic update) unless the server confirmed the write succeeded.

PART B — TEST COVERAGE

5. ACTION COMPLETENESS
   - "Create a task" means: open form → fill fields → submit → verify item appears after reload. Only opening the form is INSUFFICIENT → reject.

6. OUTCOME VERIFICATION
   - Good: await expect(page.locator('text=My New Task')).toBeVisible()
   - Bad:  await expect(page.locator('input')).toBeVisible()
   - For mutations: at least one test verifies persistence (reload the page and re-check).

7. SELECTOR QUALITY
   - Prefer aria-label, role, data-testid, text content. REJECT tests using CSS class selectors or deep implementation-detail chains that break on styling changes.

8. HARDCODED WAITS
   - waitForTimeout() is fragile. Prefer waitForSelector, waitForURL, or expect().toBeVisible({ timeout }). Flag every waitForTimeout.

9. TEST ISOLATION
   - Tests that create data should use unique identifiers (e.g., timestamp in name) so they don't conflict with parallel runs.

10. EXISTING TESTS
    - If the diff modifies a component or action that has existing tests, verify those tests still pass.

REDESIGN TEST HANDLING (applies only when plan TYPE is REDESIGN):
- Test file deletions are expected when the corresponding production code is deleted. Do not reject deletion of tests for removed components.
- Replacement tests must cover the SAME user-facing behaviors as the removed tests. If a deleted component had 3 test scenarios and the replacement has 1 → REJECT as coverage regression.

If all checks pass, answer APPROVED.
