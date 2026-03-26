---
name: review-plan
description: Spawns review agents to review a plan or code diff in parallel. Each agent answers one binary yes/no question covering security, data integrity, code quality, standards, correctness, integration, scope, reliability, and testing. Use after writing PLAN.md and after building code.
user_invocable: true
---

# review-plan

Review a PLAN.md or code diff by spawning independent sub-agents in parallel. Each answers one focused question with APPROVED or REJECTED plus a specific reason.

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

## Step 2 — Spawn Sub-Agents in Parallel

Use the Agent tool to spawn all agents simultaneously. Each agent receives ONLY the plan text or diff — never the main conversation context. Each returns a single verdict: `APPROVED` or `REJECTED: [specific reason]`.

**Note:** The canonical review prompts are in `.claude/review-agents/agent-N-name.md`. The prompts below are kept inline for convenience during local advisory reviews. The GitHub Action code review reads from the shared files. If prompts need updating, update the files in `.claude/review-agents/` first, then sync the inline versions here.

**Important:** The local review is advisory — for fast feedback during development. The authoritative code review runs in GitHub Actions as a required merge check.

### Agent 1 — Security & Data Integrity

```
Review this plan or code diff for security and data integrity issues in this Next.js + Supabase + Netlify stack.
Answer APPROVED or REJECTED with a specific reason citing the exact line or file.

Checklist — reject if ANY item fails:

1. SUPABASE QUERY SAFETY
   - Any .select('*') → REJECT. Must list explicit columns.
   - Any list query missing .limit() → REJECT.

2. RLS AND AUTH
   - Tables must have RLS enabled with policies filtering by auth.uid().
   - Server actions must call supabase.auth.getUser() and handle !user BEFORE any database operation.
   - Server actions must never trust client-sent user IDs — always use getUser().
   - service_role key must never appear in client-side code.

3. FORBIDDEN PATTERNS
   - dangerouslySetInnerHTML, eval(), new Function(), raw SQL concatenation → REJECT.
   - console.log/warn/error/debug in app code → REJECT. Exception: scripts/, test files, .github/ scripts.
   - Hardcoded secrets or API keys → REJECT.

4. ENVIRONMENT VARIABLE SAFETY
   - SUPABASE_SERVICE_ROLE_KEY must only appear in server-side files.

5. VALUE-TO-COLUMN COMPATIBILITY
   - PostgreSQL int4 max is 2,147,483,647. Date.now() returns ~1.7 trillion → REJECT if assigned to any integer column.

6. SILENT FAILURE DETECTION
   - Auth checks that return empty data instead of errors → flag.
   - Catch blocks returning {} or [] without logging → REJECT.
   - Supabase queries where error is not checked → REJECT.
   - Success and error paths returning same shape → flag.

7. DUPLICATE PREVENTION & DATA PRESERVATION
   - Mutation buttons must disable during processing.
   - User input must not be cleared on error.

8. SCHEMA CHANGES
   - New tables/columns/constraints must have migration files. Dashboard-only changes → REJECT.

If all checks pass, answer APPROVED.
```

### Agent 2 — Code Quality & Standards

```
Review this plan or code diff for code quality, standards compliance, and pattern consistency.
Answer APPROVED or REJECTED with a specific reason citing the exact line or file.

REDESIGN HANDLING: If TYPE is REDESIGN, new components replacing items in "Files to Delete" are intentional — only flag duplication against files NOT in the deletion plan.

Checklist — reject if ANY item fails:

1. SANDI METZ RULES
   - Files over 100 CODE lines → REJECT. (Exempt: migrations, tests, type-only files.)
   - Functions over 25 CODE lines → REJECT.
   - More than 4 parameters → REJECT.
   - Nesting deeper than 3 levels → REJECT.
   - More than 3 exported members per file → REJECT. (Type exports exempt.)

2. TYPESCRIPT STRICT
   - 'any' type → REJECT. 'as any' or 'as unknown as X' → REJECT.

3. FUNCTION DOCUMENTATION
   - Exported functions must explain: trigger, steps, return value. Restating the name is insufficient → REJECT.

4. FILE NAMING & HEADERS
   - kebab-case.ts, PascalCase.tsx, use-hook.ts.
   - Files in apps/ need FILE, PURPOSE, CALLED BY, DATA FLOW headers. (Exempt: config, migrations, .claude/, .github/, packages/.)

5. FORBIDDEN IN PRODUCTION CODE
   - console.log → REJECT. Commented-out code → REJECT.
   - 'use client' with no interactivity → REJECT.

6. ESTABLISHED PATTERNS
   - Supabase server client: use getServerClient() with getAll/setAll cookie API.
   - TanStack Query: queryFn: () => action() (arrow wrapper required).
   - Server actions: 'use server' → getServerClient() → getUser() → validate → mutate → revalidatePath. Return { error? }, never throw.
   - sort_order: use array.length, never Date.now().

7. COMPONENT & DATA PATTERNS
   - One component per file. 'use client' only with hooks/handlers.
   - Zustand with granular selectors only.
   - Every async action: loading, success, error states.
   - Every list component: handle empty state.

8. DESIGN REGISTRY & CODE REUSE
   - Check docs/DESIGN-REGISTRY.md. Duplicating a registered pattern → REJECT.
   - DB queries through @upp/db, not raw supabase.from() in components.

If all checks pass, answer APPROVED.
```

### Agent 3 — Correctness & Integration

```
Review this plan or code diff for integration correctness and plan fidelity.
Answer APPROVED or REJECTED with a specific reason citing the exact line or file.

PART A — INTEGRATION CORRECTNESS

1. SUPABASE CLIENT: Server clients must use getAll/setAll cookie API. Importing from @upp/db in thriving-mobile server actions → flag.

2. TANSTACK QUERY: queryFn: () => action() required. Direct reference → REJECT.

3. POSTGRESQL TYPES: int4 max 2,147,483,647. Date.now() → REJECT for integer columns.

4. NETLIFY SERVERLESS: setAll callbacks must wrap set() in try/catch.

5. NEXT.JS APP ROUTER: 'use server' files export only async functions. Server Components cannot use hooks. Client Components cannot pass server actions to non-serializable contexts.

PART B — SCOPE & PLAN FIDELITY

6. PUSHBACK CHECK: Missing or empty ## Pushback section → REJECT.

7. LESSONS ADDRESSED: Missing or empty ## Lessons Addressed → REJECT.

8. SCOPE: Unrelated fixes bundled → REJECT. File count exceeds estimate by 2+ → REJECT.

9. PLAN FIDELITY: Files changed but not in plan (excluding tests, config, plans/) → REJECT. Plan lists file with no changes → flag.

10. REDESIGN FIDELITY: Unplanned deletions → REJECT. Planned deletions not executed → REJECT. FEATURE plan with git rm → REJECT.

If all checks pass, answer APPROVED.
```

### Agent 4 — Reliability & Testing

```
Review this plan or code diff for reliability, silent failure risks, and test coverage.
Answer APPROVED or REJECTED with a specific reason citing the exact line or file.

Infrastructure-only changes (CI, docs, tooling, .claude/, .github/) are EXEMPT from test coverage.

PART A — SILENT FAILURE

1. CATCH BLOCKS: Must log error (Sentry) before returning message. Empty catch {} → REJECT. Catch returning []/null without logging → REJECT.

2. EMPTY RETURNS: Both auth-fail and catch paths return []/null → REJECT unless error path logs.

3. SUPABASE ERRORS: error not destructured → REJECT. error not checked → REJECT.

4. MUTATION FEEDBACK: Same shape for success/error → flag. No success UI without server confirmation.

PART B — TEST COVERAGE

5. ACTION COMPLETENESS: Full user flow required (open → fill → submit → verify).

6. OUTCOME VERIFICATION: Verify visible results, not just element existence. Mutations need persistence check (reload + verify).

7. SELECTORS: Prefer aria-label, role, data-testid. CSS class selectors → REJECT.

8. HARDCODED WAITS: waitForTimeout → flag. Use waitForSelector or expect().toBeVisible({ timeout }).

9. TEST ISOLATION: Unique identifiers for created data.

REDESIGN: Test deletions OK when production code deleted. Replacement tests must cover same behaviors.

If all checks pass, answer APPROVED.
```

## Step 3 — Collect Verdicts

Wait for all agents to complete. Present results as:

```
## Review Results

| # | Task | Verdict |
|---|------|---------|
| 1 | Security & Data Integrity | APPROVED / REJECTED: reason |
| 2 | Code Quality & Standards | APPROVED / REJECTED: reason |
| 3 | Correctness & Integration | APPROVED / REJECTED: reason |
| 4 | Reliability & Testing | APPROVED / REJECTED: reason |
```

## Step 4 — Handle Results

- **All APPROVED (plan review):** In the plan file's "COUNCIL PLAN REVIEW" section, set `RESULT: PASS`. Also write `COUNCIL_PLAN_REVIEW: PASS` for backward compatibility. This marker is required by require-plan hook before code edits are allowed. Tell the user the plan passed review.
- **All APPROVED (code review):** In the plan file's "COUNCIL CODE REVIEW" section, set `RESULT: PASS`. Also write `COUNCIL_CODE_REVIEW: PASS` for backward compatibility with pre-push hook. Tell the user the code passed review.
- **After PR created:** In the plan file's "HUMAN APPROVAL" section, set `STATUS: COMPLETED — PR #[number]`. This locks the plan — no more code edits until a new plan is created.
- **Any REJECTED:** List the specific rejections. Revise the plan or code to address each rejection. Then re-run the review on the revised version.

## Rules

- Sub-agents must NEVER see the main conversation — they only see the plan or diff
- All agents must run in PARALLEL, not sequentially
- Each agent returns exactly one verdict — no discussions or maybes
- Never skip a review agent, even if you think it doesn't apply

## Defense in Depth

These critical patterns are caught by 2+ agents:
- `.select('*')`: Agent 1 + Agent 2
- Missing `.limit()`: Agent 1 + Agent 2
- `console.log` in production: Agent 1 + Agent 2
- `Date.now()` as sort_order: Agent 1 + Agent 2 + Agent 3
- `queryFn` without arrow wrapper: Agent 2 + Agent 3
- Wrong Supabase cookie API: Agent 2 + Agent 3
- Silent error swallowing: Agent 1 + Agent 4
- REDESIGN deletion fidelity: Agent 3 + Agent 4
