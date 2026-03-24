# Plan: Fix CI failures blocking PR #134

## TYPE
REDESIGN

## Task
Fix two CI failures blocking every PR: (1) Dead Code Check fails because TaskRow.tsx is orphaned after PR #131 deleted its importers. (2) Type Check fails because why-this.test.ts line 34 uses array index access that returns `string | undefined` under noUncheckedIndexedAccess, but `due_date` expects `string | null`.

## Approach
- Delete orphaned TaskRow.tsx — PR #131 deleted QueueList.tsx and OverdueList.tsx (its only importers) but missed this file
- Fix why-this.test.ts line 34: replace `.split('T')[0]` with `.slice(0, 10)` which returns `string` (no undefined risk)

## Files to Delete
- `apps/thriving-mobile/src/components/TaskRow.tsx` — orphaned; importers (QueueList.tsx, OverdueList.tsx) deleted in PR #131

## Files to Change
- `apps/thriving-mobile/src/lib/why-this.test.ts` — fix due_date type from `string | undefined` to `string`

## Scope
small (1 delete, 1 modify = 2 files)

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
