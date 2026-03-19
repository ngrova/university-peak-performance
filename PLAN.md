# Plan: Clean working tree + add clean-tree workflow rule

## Task
"Clean up all dirty files from previous tasks. Add a rule requiring a clean working tree before starting any new task."

## Approach
- Commit workflow.md (approved rule changes), CLAUDE.md (lessons learned), PLAN.md
- Discard stale files: ACTION-PLAN.md, PLAN.md.bak, ROADMAP-v4.md, apps/thriving/src/app/api/
- Add .claude/settings.local.json and .claude/worktrees/ to .gitignore
- Add clean-tree rule to .claude/rules/workflow.md

## Files to Change
- `.claude/rules/workflow.md` — add clean working tree rule + commit pending changes
- `CLAUDE.md` — commit pending lessons learned
- `.gitignore` — add .claude/settings.local.json and .claude/worktrees/

## Files to Delete
- `ACTION-PLAN.md`, `PLAN.md.bak`, `ROADMAP-v4.md` — stale docs
- `apps/thriving/src/app/api/sentry-test/route.ts` — test artifact

## Scope
small (3 changed, 4 deleted)

## STATUS: APPROVED
