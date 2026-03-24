# Plan: Enforce 9-agent review for sub-agent work

## TYPE
FEATURE

## Task
Sub-agents building PRs in parallel worktrees bypass the 9-agent review council. Add permanent rule requiring the full pipeline for all delegated work.

## Approach
- Add "Sub-Agent Pipeline Rule" section to CLAUDE.md between REDESIGN PRs and Critical Rules
- Add lesson learned entry documenting the incident

## Files to Change
- `CLAUDE.md` — add sub-agent pipeline rule + lesson learned

## Scope
small (1 file)

## STATUS: APPROVED
