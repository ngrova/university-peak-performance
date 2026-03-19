# Plan: Fix require-plan hook to prevent stale plan reuse

## Task
"Fix the require-plan hook so stale approvals can't bypass it. After a PR is created, reset PLAN.md to STATUS: COMPLETED. The hook should only allow code changes when STATUS: APPROVED exists AND the plan was written for the current work."

## Approach
- Update require-plan.js to only pass when STATUS: APPROVED exists (unchanged)
- Update workflow.md to document that PLAN.md must be reset to STATUS: COMPLETED after PR creation
- Add a post-PR step in the pipeline rules: after creating a PR, set STATUS: COMPLETED in PLAN.md
- This way the next task starts with a stale/completed plan that blocks edits until a new plan is approved

## Files to Change
- `.claude/hooks/require-plan.js` — no logic change needed (already blocks non-APPROVED)
- `.claude/rules/workflow.md` — add step: reset PLAN.md to STATUS: COMPLETED after PR
- `PLAN.md` — reset current stale plan to COMPLETED

## Scope
small (2 changed files + PLAN.md itself)

## STATUS: COMPLETED
