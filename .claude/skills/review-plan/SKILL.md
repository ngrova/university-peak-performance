---
name: review-plan
description: Spawns 8 task-based sub-agents to review a plan or code diff in parallel. Each agent answers one binary yes/no question covering security, data integrity, reuse, standards, conflicts, scope, pattern consistency, and test coverage. Use after writing PLAN.md and after building code.
user_invocable: true
---

# review-plan

Review a PLAN.md or code diff by spawning 8 independent sub-agents in parallel. Each answers one focused question with APPROVED or REJECTED plus a specific reason.

## Step 1 — Determine Review Mode

- **Plan review:** Read PLAN.md at the repo root
- **Code review:** Run `git diff` to get the current code changes

If PLAN.md exists and has `STATUS: APPROVED`, and there are staged/unstaged code changes, default to code review mode. Otherwise review the plan.

## Step 2 — Spawn 8 Sub-Agents in Parallel

Use the Agent tool to spawn all 8 agents simultaneously. Each agent receives ONLY the plan text or diff — never the main conversation context. Each returns a single verdict: `APPROVED` or `REJECTED: [specific reason]`.

### Agent 1 — Security Audit

```
Review this for security issues. Answer APPROVED or REJECTED with a specific reason.

Checklist:
- Can users see other users' data? Are RLS policies filtering by auth.uid()?
- Are API keys or secrets exposed in frontend/client code?
- Is the Supabase service_role key absent from ALL client-side code?
- Are rate limits enforced on the backend, not just frontend?
- Are sensitive fields stored on user-editable tables?
- If storage buckets involved, are policies scoped to ownership (auth.uid() = owner_id)?
- Is input validation at the DATABASE level (constraints, RLS), not only React?
- Does any query use .select('*')? If yes, REJECT — always list explicit columns.
- Does code use dangerouslySetInnerHTML, raw SQL strings, or eval()? If yes, REJECT.
- Are budget caps considered for external services?
```

### Agent 2 — Data Integrity

```
Review this for data integrity issues. Answer APPROVED or REJECTED with a specific reason.

Checklist:
- If Supabase schema changes, is there a migration file committed to the repo?
- Can a user create duplicates by double-tapping or retrying on slow connection?
- Are there race conditions where concurrent requests could corrupt data?
- Are database constraints (CHECK, NOT NULL, UNIQUE) used for validation?
- Are submit buttons disabled during processing?
```

### Agent 3 — Code Reuse

```
Review this for unnecessary duplication. Answer APPROVED or REJECTED with a specific reason.

Checklist:
- Does this duplicate something already in the codebase?
- Could an existing component, hook, or utility be extended instead?
- Are there shared patterns being reimplemented from scratch?
```

### Agent 4 — Sandi Metz Compliance

```
Review this for coding standards compliance. Answer APPROVED or REJECTED with a specific reason.

Checklist:
- Will all files stay under 100 lines?
- Will all functions stay under 25 lines?
- Are there 4 or fewer parameters per function?
- Is TypeScript strict with no use of 'any'?
- Does every function have a one-line comment explaining what it does?
- Is nesting kept to 3 levels max?
- Are there 3 or fewer exports per file?
```

### Agent 5 — Decision Conflict

```
Review this for conflicts with existing decisions. Answer APPROVED or REJECTED with a specific reason.

Read docs/DECISIONS_LOG.md and check:
- Does this contradict any prior architectural decision?
- Does it break an established pattern in the codebase?
- Does it introduce a technology or approach that conflicts with the stack?
```

### Agent 6 — Scope

```
Review the scope of this change. Answer APPROVED or REJECTED with a specific reason.

Checklist:
- Is this trying to do too much in one PR?
- Can it be broken into smaller, independently shippable pieces?
- Are more than 8 files being changed? If so, consider splitting.
- Is the scope estimate accurate (small: 1-3 files, medium: 4-7, large: 8+)?
```

### Agent 7 — Pattern Consistency

```
Review this for pattern consistency. Answer APPROVED or REJECTED with a specific reason.

Checklist:
- Does it follow the same component structure as existing features?
- Does it use the same naming conventions (kebab-case files, PascalCase components)?
- Does it use the same Tailwind patterns and shadcn/ui components?
- Does it use the same data-fetching approach (TanStack Query for server state)?
- Does every user-facing action handle loading, success, and error states?
- Are submit buttons disabled during processing?
- On CODE REVIEW only: can this code be simplified to fewer lines without losing clarity?
```

### Agent 8 — Test Coverage

```
Review this for test coverage. Answer APPROVED or REJECTED with a specific reason.

On PLAN REVIEW:
- Do the acceptance criteria have corresponding Playwright E2E tests planned?
- Are edge cases covered (empty states, error states, unauthenticated access)?
- If the plan adds new user-facing screens or interactions, are smoke tests included?
- Infrastructure-only changes (config, CI, docs) are exempt from this check.

On CODE REVIEW:
- Does this PR include Playwright tests for every acceptance criterion?
- Do tests verify user-facing behavior (navigate, see, tap, type), not implementation details?
- Did any existing tests break?
- Are tests in the correct e2e/ directory following existing patterns?
- Infrastructure-only changes (config, CI, docs) are exempt from this check.
```

## Step 3 — Collect Verdicts

Wait for all 8 agents to complete. Present results as:

```
## Review Results

| # | Task | Verdict |
|---|------|---------|
| 1 | Security Audit | APPROVED / REJECTED: reason |
| 2 | Data Integrity | APPROVED / REJECTED: reason |
| 3 | Code Reuse | APPROVED / REJECTED: reason |
| 4 | Sandi Metz | APPROVED / REJECTED: reason |
| 5 | Decision Conflict | APPROVED / REJECTED: reason |
| 6 | Scope | APPROVED / REJECTED: reason |
| 7 | Pattern Consistency | APPROVED / REJECTED: reason |
| 8 | Test Coverage | APPROVED / REJECTED: reason |
```

## Step 4 — Handle Results

- **All 8 APPROVED:** Tell the user the plan/code passed review. Proceed with the next step in the workflow.
- **Any REJECTED:** List the specific rejections. Revise the plan or code to address each rejection. Then re-run the review on the revised version.

## Rules

- Sub-agents must NEVER see the main conversation — they only see the plan or diff
- All 8 agents must run in PARALLEL, not sequentially
- Each agent returns exactly one verdict — no discussions or maybes
- Never skip a review agent, even if you think it doesn't apply
