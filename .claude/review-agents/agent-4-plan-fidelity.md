# Agent 4 — Plan Fidelity

Reviews every diff for whether the code matches what the plan said. This agent barely looks at code quality — its job is scope discipline and structural compliance.

**GITIGNORED FILES:** If the plan's "Files to Change" or "New Files" section marks a file as gitignored, local-only, or explicitly states it will not appear in the diff, do not reject for that file being absent from the diff. Only flag missing files that are expected to be committed.

## Checklist

### 1. PUSHBACK CHECK
- Is the plan missing a `## Pushback` section? If so → FAIL.
- Is the `## Pushback` section empty (no text after the heading)? If so → FAIL.
- Does `## Pushback` contain a concern (anything other than "None") that has NOT been acknowledged by the human?
- Any other concerns related to pushback?

### 2. OPEN PRS ADDRESSED CHECK
- Is the plan missing a `## Open PRs Addressed` section? If so → FAIL.
- Is the section empty? If so → FAIL. It must list any open PRs found during pre-flight and the decision made, or state "None open."
- Any other concerns related to open PRs?

### 3. SCOPE
- Are unrelated fixes bundled together instead of addressing one concern?
- Does the actual file count exceed the plan's scope estimate (small 1-3, medium 4-7, large 8+) by more than 2?
- Is the file count high but incoherent — touching files that aren't related to each other? (Do not reject solely based on high file count — a legitimate feature may touch 10+ files if they are all related.)
- Is the plan large enough (scope large, 8+ files with substantial changes) that the assembled diff could exceed the Council's payload size check at review time? If so, should this be split into smaller PRs?
- Any other concerns related to scope?

### 4. PLAN FIDELITY (code review only)
- Does the diff modify any files NOT listed in the plan's "Files to Change" section? (Excluding test files, config like `tsconfig`/`package.json`, CI, and plan files in `plans/`.)
- Does the plan list any files that have NO changes in the diff? (May indicate incomplete work.)
- Any other concerns related to plan fidelity?

### 5. DELETION FIDELITY (applies when plan TYPE is REDESIGN or PIPELINE-INFRA)
- Are there any file deletions (`git rm`) for files NOT listed in "Files to Delete"?
- Are any files listed in "Files to Delete" still present (not actually deleted) in the diff? (Note: git may show a delete+create as a "rename" — this still counts if the old file no longer exists.)
- Does a FEATURE plan contain `git rm` commands? (File deletions require TYPE: REDESIGN or PIPELINE-INFRA.)
- Any other concerns related to deletion fidelity?

### FINAL: Any other plan fidelity or scope concerns not covered by the checks above?
