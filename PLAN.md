# Plan: Platform traps, CAUTION comments, workflow rule, and DB violation cleanup

## Task
"Create platform-traps.md rules file, add CAUTION comments at 3 dangerous boundary crossings, update workflow with knowledge-action rule, fix .select('*') and missing .limit() in packages/db/."

## Approach
- Create .claude/rules/platform-traps.md with WRONG→RIGHT patterns for the 6 known production traps
- Add CAUTION comments to supabase-server.ts, task-actions.ts, TodayContent.tsx
- Add knowledge-action rule to workflow.md Pre-Flight Check
- Fix all .select('*') violations in packages/db/ with explicit column lists
- Add .limit() to all unbounded list queries in packages/db/
- Add WARNING comment to clients.ts about get/set/remove cookie API

## Files to Change
- `.claude/rules/workflow.md` — add lesson-action rule
- `apps/thriving-mobile/src/lib/supabase-server.ts` — CAUTION comment
- `apps/thriving-mobile/src/actions/task-actions.ts` — CAUTION comment
- `apps/thriving-mobile/src/components/TodayContent.tsx` — CAUTION comment
- `packages/db/goals.ts` — explicit columns, .limit(100)
- `packages/db/pillars.ts` — explicit columns, .limit(50), .limit(500)
- `packages/db/assessments.ts` — explicit columns, .limit(50)
- `packages/db/tree.ts` — explicit columns, .limit() on all queries
- `packages/db/clients.ts` — WARNING comment

## New Files
- `.claude/rules/platform-traps.md` — platform-specific trap documentation

## Scope
large (1 new, 9 changed — coherent infrastructure cleanup)

## STATUS: APPROVED
