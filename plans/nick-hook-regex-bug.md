# Plan: Fix block-dangerous.js force-push regex false positive

## TYPE
FEATURE

## Task
Fix line 33 in block-dangerous.js: regex `git\s+push\s+.*(-f|--force)` matches `-f` as a substring of branch names (e.g., `nick/today-per-user-filter`). Anchor `-f` and `--force` as whitespace-delimited standalone flags.

## Approach
- Replace the single greedy regex with two checks: (1) is this a git push? (2) does it contain `-f` or `--force` as a standalone flag (preceded by whitespace, followed by whitespace or end-of-string)?
- New pattern: `/git\s+push/.test(cmd) && /\s(-f|--force)(\s|$)/.test(cmd)`
- This prevents branch names containing `-f` from triggering the force-push block

## Files to Change
- `.claude/hooks/block-dangerous.js` — fix force-push regex on line 33

## Scope
small (0 new, 1 modified = 1 file)

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
