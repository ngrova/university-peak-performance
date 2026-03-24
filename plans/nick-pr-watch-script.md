# Plan: PR watch script for post-PR automation

## TYPE
FEATURE

## Task
Create scripts/pr-watch.sh that handles everything after a PR is created: enables auto-merge, watches CI, polls until merged, prints final confirmation. Add to CLAUDE.md as a mandatory post-PR step.

## Approach
- Create bash script that takes PR number as argument
- Steps: enable auto-merge (squash), get CI run ID, print CI link, watch CI with exit-status, poll until merged, print confirmation
- Add mandatory rule to CLAUDE.md between "Sub-Agent Pipeline Rule" and "Critical Rules (repeated)"

## New Files
- `scripts/pr-watch.sh` — post-PR automation: auto-merge, CI watch, merge poll, confirmation

## Files to Change
- `CLAUDE.md` — add mandatory post-PR rule requiring pr-watch.sh after every PR creation

## Scope
small (1 new, 1 modified = 2 files)

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
