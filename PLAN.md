# Plan: PR 3 — Dead Code Sweeper + Hook Warning

## TYPE
FEATURE

## Task

Create scripts/check-dead-code.js that builds an import graph and flags orphaned files. Add it as a CI job. Add a warning to manager-stop.js when git rm appears in a FEATURE PR. PR 3 of 3 in pipeline evolution spec.

## Approach

- Create scripts/check-dead-code.js (~60 lines): scan apps/thriving-mobile/src/, build import graph via regex, flag files with zero inbound imports that aren't entry points
- Add dead-code CI job to .github/workflows/ci.yml (runs alongside lint, typecheck, etc.)
- Add git rm warning for FEATURE PRs to .claude/hooks/manager-stop.js

## Files to Change

- `.github/workflows/ci.yml` — add dead-code job
- `.claude/hooks/manager-stop.js` — add git rm warning for FEATURE PRs

## New Files

- `scripts/check-dead-code.js` — import graph scanner, ~60 lines

## Scope
small (3 files — 2 modified, 1 new)

## STATUS: APPROVED
