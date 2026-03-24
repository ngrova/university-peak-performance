# Plan: CI Merge Gate — Block gh pr merge Until CI Passes

## TYPE
FEATURE

## Task
Add a hook that intercepts `gh pr merge` commands and checks PR CI status in real-time. If any check is not passing, block the merge. Pure mechanical verification — no declarations needed.

## Approach

### 1. Create `.claude/hooks/require-ci-pass.js`
- Fires on Bash tool use
- Detects `gh pr merge` commands via regex
- Extracts the PR number from the command
- Runs `gh pr checks <number> --json name,state` to get real-time CI status
- If ALL checks have state "SUCCESS" → approve
- If any check is pending, failing, or missing → block with specific message listing which checks aren't passing
- If PR number can't be extracted or `gh pr checks` fails → block (fail closed)
- Allow `--auto` flag through — auto-merge is safe since GitHub itself gates on CI

### 2. Register in `.claude/settings.json`
Add to Bash matcher alongside block-dangerous.js and block-on-pushback.js

### 3. Update CLAUDE.md
Add CI Merge Gate to the pipeline documentation

## Files to Change
- `.claude/settings.json` — register hook in Bash matcher
- `CLAUDE.md` — document CI merge gate

## New Files
- `.claude/hooks/require-ci-pass.js` — the gate hook

## Scope
small

## Pushback
The `--auto` flag question: `gh pr merge --auto` tells GitHub to merge when CI passes — it doesn't bypass CI. Blocking `--auto` would be counterproductive since it's the safest merge method. The hook should allow `--auto` through and only block immediate merges (`--admin`, or merges without `--auto` when CI isn't green).

Actually, `--admin` is the real danger — it bypasses branch protection. The hook should block `gh pr merge` with `--admin` unless CI is green. And block any `gh pr merge` without `--auto` unless CI is green. `gh pr merge --auto` is always allowed since GitHub handles the gate.

## COUNCIL_CODE_REVIEW: PASS

## STATUS: COMPLETED

