# Plan: Branch-specific plan files — eliminate parallel PLAN.md conflicts

## TYPE
FEATURE

## Task
Move from a single PLAN.md to branch-specific plan files in plans/ directory. Each branch writes plans/{branch-slug}.md instead of the shared PLAN.md. Eliminates cascading merge conflicts during parallel work.

## Approach
- Create plans/ directory, add to .gitignore so plan files only exist on feature branches
- Update require-plan.js hook to check plans/{branch-slug}.md instead of root PLAN.md
- Update manager-stop.js hook to read plan TYPE from branch-specific plan file
- Update CLAUDE.md and workflow.md references from PLAN.md to plans/{branch}.md
- Update make-plan skill to write to plans/{branch}.md
- Delete root PLAN.md after migration

## Files to Change
- `.claude/hooks/require-plan.js` — check plans/{branch}.md instead of PLAN.md
- `.claude/hooks/manager-stop.js` — read plan TYPE from plans/{branch}.md
- `.gitignore` — add plans/ entry
- `CLAUDE.md` — update all PLAN.md references to branch-specific pattern
- `.claude/rules/workflow.md` — update plan file references
- `.claude/skills/make-plan/SKILL.md` — write to plans/{branch}.md

## Scope
small (6 files changed, 1 file deleted)

## STATUS: APPROVED
