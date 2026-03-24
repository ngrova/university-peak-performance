# Plan: Today Tab Per-User Filtering

## TYPE
FEATURE

## Task
Filter the Today tab's One Thing and Up Next section by the currently logged-in user's assignee. When Erin opens the app, she sees her highest-priority assigned task — not Nick's. Works for the owner too.

## Approach
- Modify `fetchTodayTasks()` to return both tasks and the current user's resolved assignee name
- Resolve assignee name from `user.user_metadata` (full_name/name), then fall back to email handle extraction, validating against known assignee values ('Nick', 'Erin', 'Liz')
- If name can't be resolved, return null → no filtering (graceful degradation to current behavior)
- In `TodayContent.tsx`, filter tasks where `assignee === assigneeName` before passing to `rankTasks()`
- Update empty state to distinguish "no assigned tasks" from "no tasks at all"
- Scoring algorithm (`rankTasks`) unchanged — filtering happens before scoring, not instead of it
- `why-this.ts`, `TodayHero.tsx`, `UpNextSection.tsx` untouched — they receive the already-filtered, scored data

## New Files
- `apps/thriving-mobile/src/lib/resolve-assignee-name.ts` — pure function: maps Supabase user → assignee name string
- `apps/thriving-mobile/src/lib/resolve-assignee-name.test.ts` — unit tests: metadata match, email fallback, unknown returns null

## Files to Change
- `apps/thriving-mobile/src/actions/today-actions.ts` — return `{ tasks, assigneeName }`, call resolveAssigneeName
- `apps/thriving-mobile/src/components/TodayContent.tsx` — filter by assignee before scoring, update empty state

## Scope
small (2 new, 2 modified = 4 files)

## Council Plan Review Results

| # | Agent | Verdict |
|---|-------|---------|
| 1 | Security Audit | APPROVED |
| 2 | Data Integrity | APPROVED |
| 3 | Code Reuse & Patterns | APPROVED |
| 4 | Sandi Metz & Standards | APPROVED |
| 5 | Integration Correctness | APPROVED |
| 6 | Scope & Plan Fidelity | APPROVED |
| 7 | Pattern Consistency | APPROVED |
| 8 | Test Coverage | APPROVED |
| 9 | Silent Failure Detector | APPROVED |

COUNCIL_PLAN_REVIEW: PASS

## Council Code Review Results

| # | Agent | Verdict |
|---|-------|---------|
| 1 | Security Audit | APPROVED |
| 2 | Data Integrity | APPROVED |
| 3 | Code Reuse & Patterns | APPROVED |
| 4 | Sandi Metz & Standards | APPROVED |
| 5 | Integration Correctness | APPROVED |
| 6 | Scope & Plan Fidelity | APPROVED |
| 7 | Pattern Consistency | APPROVED |
| 8 | Test Coverage | APPROVED |
| 9 | Silent Failure Detector | APPROVED |

COUNCIL_CODE_REVIEW: PASS

## STATUS: COMPLETED
