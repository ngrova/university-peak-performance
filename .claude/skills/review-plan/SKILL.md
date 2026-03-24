---
name: review-plan
description: Spawns 9 task-based sub-agents to review a plan or code diff in parallel. Each agent answers one binary yes/no question covering security, data integrity, established patterns, coding standards, integration correctness, scope, pattern consistency, test coverage, and silent failure detection. Use after writing PLAN.md and after building code.
user_invocable: true
---

# review-plan

Review a PLAN.md or code diff by spawning 9 independent sub-agents in parallel. Each answers one focused question with APPROVED or REJECTED plus a specific reason.

## Step 0 — Pushback Pre-Check

Before doing anything else, check if a PUSHBACK file exists for the current branch:
1. Get the current branch: `git rev-parse --abbrev-ref HEAD`
2. Compute the slug: replace `/` with `-`
3. Check if `plans/PUSHBACK-{slug}.md` exists

If the PUSHBACK file exists: **STOP. Do not run the review.** Tell the user: "Pushback is pending on this branch. Resolve plans/PUSHBACK-{slug}.md before running the review."

## Step 1 — Determine Review Mode

- **Plan review:** Read PLAN.md at the repo root
- **Code review:** Run `git diff` to get the current code changes

If PLAN.md exists and has `STATUS: APPROVED`, and there are staged/unstaged code changes, default to code review mode. Otherwise review the plan.

## Step 2 — Spawn 9 Sub-Agents in Parallel

Use the Agent tool to spawn all 9 agents simultaneously. Each agent receives ONLY the plan text or diff — never the main conversation context. Each returns a single verdict: `APPROVED` or `REJECTED: [specific reason]`.

### Agent 1 — Security Audit

```
Review this plan or code diff for security issues in this Next.js + Supabase + Netlify stack.
Answer APPROVED or REJECTED with a specific reason citing the exact line or file.

Checklist — reject if ANY item fails:

1. SUPABASE QUERY SAFETY
   - Any .select('*') → REJECT. Must list explicit columns.
     Note: .select('*, relation(col1, col2)') also counts — the top-level * is the problem.
   - Any list query missing .limit() → REJECT. All queries returning arrays must have .limit(N) or be scoped by a unique key (.eq('id', ...) + .single()).

2. RLS AND AUTH
   - Tables must have RLS enabled with policies filtering by auth.uid().
   - Server actions must call supabase.auth.getUser() and handle the !user case BEFORE any database operation.
   - Can a user pass another user's ID to modify/read their data? Server actions must never trust client-sent user IDs for authorization — always use the authenticated user's ID from getUser().
   - service_role key must never appear in client-side code or files under src/components/, src/app/(app)/, or any file with 'use client'.

3. FORBIDDEN PATTERNS
   - dangerouslySetInnerHTML → REJECT.
   - eval() or new Function() → REJECT.
   - Raw SQL string concatenation → REJECT.
   - console.log/warn/error/debug in app code → REJECT. Use Sentry. Exception: scripts/ directories and test files.
   - Hardcoded secrets, API keys, or Supabase URLs as string literals (not process.env) → REJECT.

4. ENVIRONMENT VARIABLE SAFETY
   - SUPABASE_SERVICE_ROLE_KEY must only appear in server-side files (API routes, 'use server' files, middleware).
   - NEXT_PUBLIC_ variables are OK in any file.

5. SILENT AUTH FAILURE
   - Could any auth or permission check fail silently (returning empty data instead of an error)? If a server action returns [] or null when auth fails, the UI cannot distinguish "no data" from "access denied" — flag it.

If all checks pass, answer APPROVED.
```

### Agent 2 — Data Integrity

```
Review this plan or code diff for data integrity issues in this Next.js + Supabase stack.
Answer APPROVED or REJECTED with a specific reason citing the exact line or file.

Checklist — reject if ANY item fails:

1. VALUE-TO-COLUMN COMPATIBILITY
   - For every value being INSERTed or UPDATEd, verify it fits the column type. PostgreSQL integer columns max at 2,147,483,647. Date.now() returns ~1.7 trillion. If a number assigned to sort_order, priority, or any integer column could exceed 2,147,483,647 → REJECT. Use array.length or MAX(col)+1 instead.
   - String values going into columns with CHECK constraints: verify the value satisfies the constraint (e.g., status must be 'todo', 'in_progress', or 'done').

2. SILENT FAILURE DETECTION
   - Server actions that catch errors must return an error message to the caller. A catch block that silently returns {} or [] without logging → REJECT.
   - Supabase queries: if { data, error } is returned but error is not checked → REJECT.
   - Every mutation's success path and error path must return distinguishable shapes — if both return {} the UI cannot tell them apart → flag it.

3. DUPLICATE PREVENTION
   - Mutation-triggering buttons must disable during processing (disabled={isPending} or equivalent).
   - If a mutation creates a record, is there a UNIQUE constraint or idempotency check preventing duplicates on retry?

4. SCHEMA CHANGES
   - Any new table, column, constraint, or index must have a migration file in supabase/migrations/. Dashboard-only changes → REJECT.

5. QUERY SAFETY
   - All list queries have .limit() and explicit .order()? No unbounded, unordered queries on user-facing tables.
   - Explicit column selects (no .select('*') in production code).

6. DATA PRESERVATION
   - User input (form fields, text areas) must not be cleared on error. If a mutation fails, the form should retain the user's typed data.

If all checks pass, answer APPROVED.
```

### Agent 3 — Code Reuse & Established Patterns

```
Review this plan or code diff for pattern violations against this project's established conventions.
Answer APPROVED or REJECTED with a specific reason citing the exact line or file.

New code must follow established patterns exactly, not reimplement from scratch.

REDESIGN HANDLING:
First read the TYPE field from PLAN.md. If TYPE is FEATURE or absent, apply all rules below unchanged.
If TYPE is REDESIGN:
- New components that replace items listed in "Files to Delete" are intentional replacements, not duplication. Only flag duplication against files NOT listed in the deletion plan.
- All other rules (Supabase client, TanStack Query, sort order, server action structure, DB query layer) apply identically.

1. SUPABASE SERVER CLIENT
   - Server-side code must use getServerClient() from @/lib/supabase-server.ts.
   - getServerClient() must use the getAll/setAll cookie API (@supabase/ssr v0.5+). If you see: { get: (name) => ..., set: () => {}, remove: () => {} } → REJECT. Correct pattern: { getAll: () => ..., setAll: (toSet) => { try {...} catch {} } }
   - Creating a new Supabase client with createServerClient() directly instead of importing getServerClient() → REJECT (unless this IS the definition file).

2. TANSTACK QUERY + SERVER ACTIONS
   - Server actions used as queryFn MUST be wrapped in an arrow function:
     queryFn: () => fetchMyData()       ← CORRECT
     queryFn: fetchMyData               ← REJECT (AbortSignal serialization failure)
   - Same rule applies to useMutation mutationFn.

3. SORT ORDER PATTERN
   - New sort_order values must use array.length or MAX+1, never Date.now() or timestamps. Established pattern: existingItems.length.

4. SERVER ACTION STRUCTURE
   - Must be in files with 'use server' at the top.
   - Pattern: get client → get user → validate → mutate → revalidatePath.
   - Return { error?: string } on failure, not throw or silently swallow.

5. DATABASE QUERY LAYER
   - Queries should go through @upp/db package functions, not raw supabase.from() calls in server actions or components.
   - If a new query is needed, add it to the appropriate @upp/db file.

6. GENERAL DUPLICATION
   - Does this code duplicate logic already in hooks/, utils/, components/shared/, or lib/? Check for: date formatting, error handling, Supabase client creation, form validation patterns.

If all checks pass, answer APPROVED.
```

### Agent 4 — Sandi Metz & Coding Standards

```
Review this plan or code diff for coding standards compliance.
Answer APPROVED or REJECTED with a specific reason citing the exact line and violation.

Checklist — reject if ANY item fails:

1. SANDI METZ RULES (hard limits)
   - Files over 100 CODE lines → REJECT. Comments and blank lines are excluded from the count — the limit enforces small focused logic, not penalizing documentation. (Exempt: migration files, test files, type-only files.)
   - Functions over 25 CODE lines → REJECT. Same exclusion — comments and blanks don't count.
   - More than 4 parameters on any function → REJECT. Use an options object.
   - Nesting deeper than 3 levels → REJECT. Extract inner blocks. No nested ternaries.
   - More than 3 exported members per file → REJECT. (TypeScript type/interface exports are exempt from this count.)

2. TYPESCRIPT STRICT
   - Use of 'any' type → REJECT. (Exception: deliberate SupabaseClient generic workarounds in packages/db/.)
   - 'as any' or 'as unknown as X' used to bypass type safety → REJECT.

3. FUNCTION DOCUMENTATION (expanded)
   - Every exported function must explain: what triggers it, what steps it takes, what it returns.
   - A comment that just restates the function name ("Creates a task" on createTask) is INSUFFICIENT → REJECT.
   - Comments must be understandable by someone who does not know JavaScript.
   - Private/local helpers: comment encouraged but not required if the function name is self-documenting.

4. FILE NAMING
   - .ts files: kebab-case (e.g., task-actions.ts).
   - .tsx component files: PascalCase (e.g., CaptureSheet.tsx).
   - Hook files: use- prefix (e.g., use-capture-sheet.ts).

5. FORBIDDEN IN PRODUCTION CODE
   - console.log/warn/error/debug → REJECT. Use Sentry. Exception: scripts/ directories, test files.
   - Commented-out code blocks → REJECT.
   - 'use client' on a file with no interactivity (no useState, useEffect, onClick, onChange, or other event handlers) → REJECT.

6. FILE HEADERS (required)
   - Every .ts and .tsx file in apps/ must have a header block with FILE, PURPOSE, CALLED BY, and DATA FLOW.
   - PURPOSE must be understandable by a non-technical person.
   - CALLED BY must list actual files that import this module — not generic descriptions.
   - Missing header on any new or modified file → REJECT.
   - Exempt: config files, migrations, package.json, generated files.

If all checks pass, answer APPROVED.
```

### Agent 5 — Integration Correctness

```
Review this for integration correctness. Answer APPROVED or REJECTED with a specific reason.

You check whether components will work correctly together at runtime. This is the #1 source of production bugs in this codebase.

SUPABASE CLIENT RULES:
- Server clients in thriving-mobile MUST use getAll/setAll cookie API (matching middleware.ts), NOT get/set/remove.
- Canonical pattern: apps/thriving-mobile/src/lib/supabase-server.ts.
- If createServerClient is imported from @upp/db in thriving-mobile server actions → flag (that package may use the wrong cookie API for this app's runtime).

TANSTACK QUERY + SERVER ACTION RULES:
- Server actions passed to queryFn MUST be wrapped in arrow function:
  queryFn: () => myServerAction()   ← CORRECT
  queryFn: myServerAction           ← REJECT (AbortSignal serialization)
- Same rule for useMutation mutationFn.

POSTGRESQL TYPE RULES:
- Values assigned to integer (int4) columns must fit 32-bit signed range (-2,147,483,648 to 2,147,483,647).
- Date.now() returns ~1.7 trillion → REJECT if assigned to any integer column.
- sort_order must use monotonic counter (existingItems.length), not timestamp.

NETLIFY SERVERLESS RULES:
- cookieStore.set() throws in Netlify serverless outside mutation context. setAll callbacks MUST wrap set() in try/catch.

NEXT.JS APP ROUTER RULES:
- 'use server' files must only export async functions.
- Server Components cannot use hooks (useState, useEffect, etc.).
- Client Components must not pass server actions to non-serializable contexts (event handlers are fine, queryFn direct reference is not).

CROSS-APP CONSISTENCY:
- If the same operation exists in apps/thriving/ (desktop), verify the new code in apps/thriving-mobile/ uses a compatible approach. Flag divergences with a specific reason.

If all checks pass, answer APPROVED.
```

### Agent 6 — Scope & Plan Fidelity

```
Review the scope and plan fidelity of this change. Answer APPROVED or REJECTED with a specific reason.

PUSHBACK CHECK:
- If plans/PUSHBACK-{branch-slug}.md exists, REJECT with "pushback not resolved — resolve the pushback file before reviewing."
- If the plan has no ## Pushback section → REJECT with "plan missing required ## Pushback section."
- If the ## Pushback section is empty (no text after the heading) → REJECT with "## Pushback section must not be empty."
- If ## Pushback contains a concern (anything other than "None") → flag: "Pushback declared — verify human has acknowledged before approving."

SCOPE:
- Does the change address ONE concern? Unrelated fixes bundled together → REJECT.
- Scope estimate in PLAN.md: small (1-3 files), medium (4-7), large (8+). If actual file count exceeds the estimate by more than 2 → REJECT with "scope grew beyond plan estimate."

PLAN FIDELITY (code review only):
- Compare changed files in the diff against PLAN.md "Files to Change" section.
- If the diff modifies files NOT listed in the plan (excluding test files, config like tsconfig/package.json, and CI) → REJECT with "unplanned file change: [filename]."
- If the plan lists a file with NO changes in the diff, flag it (may indicate incomplete work).

REDESIGN PLAN FIDELITY (applies only when PLAN.md TYPE is REDESIGN):
- File deletions (git rm) are expected ONLY for files listed in "Files to Delete." Unplanned deletions → REJECT.
- Files listed in "Files to Delete" that are NOT actually deleted in the diff → REJECT as incomplete work.
- Net file count should generally decrease or stay flat. Small increases are acceptable when splitting large files to meet Sandi Metz limits.
- A FEATURE plan that contains git rm commands → REJECT with "file deletions require TYPE: REDESIGN."
- REDESIGN PRs deleting 10+ files → flag and recommend splitting into smaller PRs.

WORKING TREE CLEANLINESS (code review only):
- If there are untracked or modified files NOT related to the current plan, REJECT with "dirty working tree — commit or discard unrelated files first."

DO NOT reject solely based on file count. A legitimate feature may touch 10+ files if they are all coherent. Judge by coherence, not by a number.

If all checks pass, answer APPROVED.
```

### Agent 7 — Pattern Consistency

```
Review this for pattern consistency. Answer APPROVED or REJECTED with a specific reason.

You check that new code follows EXACT patterns already in the codebase.

DESIGN REGISTRY CHECK:
- Read docs/DESIGN-REGISTRY.md for canonical shared UI patterns.
- If a new component duplicates a registered pattern (e.g., building a new progress indicator when ProgressRing exists), REJECT with "use canonical [PatternName] from registry."
- At plan review this is a soft check (flag overlap). At code review this is a hard check (reject duplicates without justification).

REDESIGN HANDLING:
First read the TYPE field from PLAN.md. If TYPE is FEATURE or absent, apply all rules below unchanged.
If TYPE is REDESIGN:
- Check docs/DESIGN-REGISTRY.md for canonical patterns. Flag any new component that duplicates a registered pattern.
- If the PR touches a file using a deprecated pattern listed in the registry, require migration or explicit deferral justification with a bounded scope ("will migrate in Phase N cleanup").

TOUCH-IT-IMPROVE-IT RULE (applies to ALL PR types):
- If a PR touches a file that uses a deprecated pattern listed in the registry's "Deprecated patterns" section, require one of:
  1. Migrate that file to the canonical pattern in this PR
  2. Add an explicit deferral justification in the plan with bounded scope
- This ensures deprecated patterns collapse over time instead of persisting.

COMPONENT STRUCTURE:
- One component per file, PascalCase filename.
- 'use client' only when the component uses hooks or event handlers.

DATA FETCHING:
- Server state: TanStack Query useQuery/useMutation.
- Client state: Zustand with granular selectors (never useStore() with no selector).
- Server actions in files under src/actions/ with 'use server'.
- Every server action: getServerClient() → getUser() → validate → mutate → revalidatePath.
- Every useQuery call: queryFn: () => serverAction() (arrow wrapper required).

SUPABASE QUERIES:
- Always list explicit columns — REJECT any .select('*').
- Always include .limit() on list queries (default 50).

ERROR HANDLING:
- Every user-facing async action handles 3 states: loading, success, error.
- Error messages: "Failed to [verb] — [what to do]"
- try/catch wraps every async call in server actions.
- Pages/routes wrapped in error boundaries.

EMPTY STATES:
- Every list/collection component handles zero-items case with a user-friendly message, not a blank screen.

NAMING:
- kebab-case.ts, ComponentName.tsx, use-hook-name.ts, *.test.ts.
- 3 or fewer exports per file (excluding TypeScript types).

PRODUCTION READINESS:
- No console.log/warn/error/debug in committed code. Use Sentry. Exception: scripts/ and test files.
- No commented-out code blocks.

If all checks pass, answer APPROVED.
```

### Agent 8 — Test Coverage

```
Review this for test coverage. Answer APPROVED or REJECTED with a specific reason.

Infrastructure-only changes (CI config, docs, tooling, .claude/) are EXEMPT.

ON PLAN REVIEW:
- For each acceptance criterion describing a user ACTION (create, edit, delete, complete, navigate), the plan MUST include a test that:
  1. Performs the full action (not just checks an element exists)
  2. Verifies the OUTCOME (data changed, item appeared/disappeared)
- "Page loads" and "element is visible" are smoke tests — they do NOT satisfy action-based acceptance criteria.
- Failure paths: if the feature has a form or mutation, at least one error-case test.

ON CODE REVIEW:
- ACTION COMPLETENESS: "Create a task" means: open form → fill fields → submit → verify item appears after reload. Only opening the form is INSUFFICIENT → reject.
- OUTCOME VERIFICATION:
  Good: await expect(page.locator('text=My New Task')).toBeVisible()
  Bad:  await expect(page.locator('input')).toBeVisible()
- For mutations: at least one test verifies persistence (reload the page and re-check).
- SELECTOR QUALITY: Prefer aria-label, role, data-testid, text content. REJECT tests using CSS class selectors or deep implementation-detail chains that break on styling changes.
- HARDCODED WAITS: waitForTimeout() is fragile. Prefer waitForSelector, waitForURL, or expect().toBeVisible({ timeout }). Flag every waitForTimeout.
- TEST ISOLATION: Tests that create data should use unique identifiers (e.g., timestamp in name) so they don't conflict with parallel runs.
- EXISTING TESTS: If the diff modifies a component or action that has existing tests, verify those tests still pass.

REDESIGN TEST HANDLING (applies only when PLAN.md TYPE is REDESIGN):
- Test file deletions are expected when the corresponding production code is deleted. Do not reject deletion of tests for removed components.
- Replacement tests must cover the SAME user-facing behaviors as the removed tests. If a deleted component had 3 test scenarios and the replacement has 1 → REJECT as coverage regression.
- Orphaned test files (tests that import or reference deleted components) → REJECT as cleanup incomplete.

If all checks pass, answer APPROVED.
```

### Agent 9 — Silent Failure Detector

```
Review this for silent failure risks. Answer APPROVED or REJECTED with a specific reason.

A "silent failure" is when an error occurs but the user sees empty data, a vague message, or no feedback at all. This is the #1 cause of production bugs in this codebase (3 of 7 real incidents were silent failures).

CATCH BLOCK AUDIT:
- Every catch block in a server action or API route MUST log the error (Sentry captureException or structured logger) BEFORE returning a user-facing message.
  Bad:  catch { return { error: 'Failed to save' } }
  Good: catch (err) { captureException(err); return { error: 'Failed to save — try again' } }
- catch {} (empty catch, no parameter) → ALWAYS REJECT.
- catch blocks that return [] or null without logging → REJECT. These hide data-fetching failures as "no data."

EMPTY RETURN ANALYSIS:
- If a function returns [] or null in BOTH the "not authenticated" path AND the catch path, the caller CANNOT distinguish "no data" from "fetch failed." REJECT unless the error path logs before returning.

SUPABASE ERROR HANDLING:
- After every Supabase query: const { data, error } = await supabase.from(...)
  If error is not destructured → REJECT (errors silently ignored).
  If error is destructured but not checked (no if (error)) → REJECT.

MUTATION FEEDBACK:
- After a mutation, the user must see confirmation it worked. If a mutation's success path and error path return the same shape (both return {}), the UI cannot distinguish success from failure → flag it.
- No "success" UI (toast, modal close, optimistic update) unless the server confirmed the write succeeded.

If all checks pass, answer APPROVED.
```

## Step 3 — Collect Verdicts

Wait for all 9 agents to complete. Present results as:

```
## Review Results

| # | Task | Verdict |
|---|------|---------|
| 1 | Security Audit | APPROVED / REJECTED: reason |
| 2 | Data Integrity | APPROVED / REJECTED: reason |
| 3 | Code Reuse & Patterns | APPROVED / REJECTED: reason |
| 4 | Sandi Metz & Standards | APPROVED / REJECTED: reason |
| 5 | Integration Correctness | APPROVED / REJECTED: reason |
| 6 | Scope & Plan Fidelity | APPROVED / REJECTED: reason |
| 7 | Pattern Consistency | APPROVED / REJECTED: reason |
| 8 | Test Coverage | APPROVED / REJECTED: reason |
| 9 | Silent Failure Detector | APPROVED / REJECTED: reason |
```

## Step 4 — Handle Results

- **All 9 APPROVED:** Tell the user the plan/code passed review. Proceed with the next step in the workflow.
- **Any REJECTED:** List the specific rejections. Revise the plan or code to address each rejection. Then re-run the review on the revised version.

## Rules

- Sub-agents must NEVER see the main conversation — they only see the plan or diff
- All 9 agents must run in PARALLEL, not sequentially
- Each agent returns exactly one verdict — no discussions or maybes
- Never skip a review agent, even if you think it doesn't apply

## Defense in Depth

These critical patterns are caught by 2+ agents:
- `.select('*')`: Agent 1 + Agent 7
- Missing `.limit()`: Agent 1 + Agent 2 + Agent 7
- `console.log` in production: Agent 1 + Agent 4 + Agent 7
- `Date.now()` as sort_order: Agent 2 + Agent 3 + Agent 5
- `queryFn` without arrow wrapper: Agent 3 + Agent 5
- Wrong Supabase cookie API: Agent 3 + Agent 5
- Silent error swallowing: Agent 2 + Agent 9
- REDESIGN deletion fidelity: Agent 6 + Agent 8
