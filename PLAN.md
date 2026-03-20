# Plan: PR 1 — TYPE Field + Agent Prompt Updates

## TYPE
FEATURE

## Task

Add TYPE field (FEATURE | REDESIGN) to the PLAN.md template, update agent prompts for Agents 3, 6, and 8 with conditional REDESIGN clauses, and update workflow docs + CLAUDE.md handbook. This is PR 1 of 3 in a pipeline evolution spec approved by Nick to solve three problems: agents fighting redesign work, dead code accumulation, and pattern drift.

## Approach

- Add `## TYPE` and `## Files to Delete` sections to the make-plan SKILL.md template
- Add conditional REDESIGN blocks to Agents 3, 6, 8 in review-plan SKILL.md (Agent 7 deferred to PR 2 with registry)
- Update the PLAN.md format example in workflow.md to include the new fields
- Add a REDESIGN PRs section to both workflow.md and CLAUDE.md
- TYPE defaults to FEATURE if omitted — zero change to existing behavior
- All 4 files ship in one atomic commit — no partial rollout risk

## Exact Agent Conditional Logic

**Agent 3 (Code Reuse) REDESIGN clause:**
- New components replacing items in "Files to Delete" are intentional — only flag duplication against files NOT being deleted
- All other rules (Supabase client, TanStack Query, sort order, server actions, DB layer) unchanged

**Agent 6 (Scope) REDESIGN clause:**
- Deletions expected ONLY if listed in "Files to Delete" — unplanned deletions still rejected
- Files listed but NOT deleted → reject as incomplete work
- Net file count should generally decrease or stay flat — small increases acceptable when splitting files to meet Sandi Metz limits
- FEATURE plan with git rm commands → reject ("should be REDESIGN")
- REDESIGN PRs deleting 10+ files → recommend splitting

**Agent 8 (Test Coverage) REDESIGN clause:**
- Test deletions expected when corresponding production code is deleted
- Replacement tests must cover SAME user-facing behaviors as removed tests
- Orphaned test files (testing deleted components) → reject

## Files to Change

- `.claude/skills/make-plan/SKILL.md` — add TYPE + Files to Delete to template, adjust line limit to 40/60 tiered
- `.claude/skills/review-plan/SKILL.md` — add REDESIGN conditional blocks to Agents 3, 6, 8
- `.claude/rules/workflow.md` — update PLAN.md format, add REDESIGN PRs section
- `CLAUDE.md` — add REDESIGN PRs handbook section

## Scope
small (4 files)

## STATUS: APPROVED
