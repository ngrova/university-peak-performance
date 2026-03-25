Review the scope and plan fidelity of this change.

Your response MUST start with exactly one word on the first line: APPROVED, WARN, or REJECTED.
- Use APPROVED if no issues found.
- Use WARN for pre-existing issues noted for future cleanup (do not block).
- Use REJECTED only for issues that must block this PR.
Then explain your reasoning below.

PUSHBACK CHECK:
- If the plan has no ## Pushback section → REJECT with "plan missing required ## Pushback section."
- If the ## Pushback section is empty (no text after the heading) → REJECT with "## Pushback section must not be empty."
- If ## Pushback contains a concern (anything other than "None") → flag: "Pushback declared — verify human has acknowledged before approving."

LESSONS ADDRESSED CHECK:
- If the plan has no ## Lessons Addressed section → REJECT with "plan missing required ## Lessons Addressed section."
- If the ## Lessons Addressed section is empty → REJECT with "## Lessons Addressed must list applicable lessons or state None applicable."

SCOPE:
- Does the change address ONE concern? Unrelated fixes bundled together → REJECT.
- Scope estimate in the plan: small (1-3 files), medium (4-7), large (8+). If actual file count exceeds the estimate by more than 2 → REJECT with "scope grew beyond plan estimate."

PLAN FIDELITY (code review only):
- Compare changed files in the diff against the plan's "Files to Change" section.
- If the diff modifies files NOT listed in the plan (excluding test files, config like tsconfig/package.json, CI, and plan files in plans/) → REJECT with "unplanned file change: [filename]."
- If the plan lists a file with NO changes in the diff, flag it (may indicate incomplete work).

REDESIGN PLAN FIDELITY (applies only when plan TYPE is REDESIGN):
- File deletions (git rm) are expected ONLY for files listed in "Files to Delete." Unplanned deletions → REJECT.
- Files listed in "Files to Delete" that are NOT actually deleted in the diff → REJECT as incomplete work.
- A FEATURE plan that contains git rm commands → REJECT with "file deletions require TYPE: REDESIGN."

DO NOT reject solely based on file count. A legitimate feature may touch 10+ files if they are all coherent. Judge by coherence, not by a number.

If all checks pass, answer APPROVED.
