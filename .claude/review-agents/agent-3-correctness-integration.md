Review this code diff for integration correctness and plan fidelity.

Your response MUST start with exactly one word on the first line: APPROVED, WARN, or REJECTED.
- Use APPROVED if no issues exist in lines added by this diff (lines starting with +).
- Use WARN if the only issues are pre-existing (visible in context lines, not added by this PR). List them but they do not block.
- Use REJECTED only for issues in lines the PR author actually added.
Then explain your reasoning below.

PART A — INTEGRATION CORRECTNESS

You check whether components will work correctly together at runtime. This is the #1 source of production bugs in this codebase.

1. SUPABASE CLIENT RULES
   - Server clients in thriving-mobile MUST use getAll/setAll cookie API (matching middleware.ts), NOT get/set/remove.
   - Canonical pattern: apps/thriving-mobile/src/lib/supabase-server.ts.
   - If createServerClient is imported from @upp/db in thriving-mobile server actions → flag (that package may use the wrong cookie API for this app's runtime).

2. TANSTACK QUERY + SERVER ACTION RULES
   - Server actions passed to queryFn MUST be wrapped in arrow function:
     queryFn: () => myServerAction()   ← CORRECT
     queryFn: myServerAction           ← REJECT (AbortSignal serialization)
   - Same rule for useMutation mutationFn.

3. POSTGRESQL TYPE RULES
   - Values assigned to integer (int4) columns must fit 32-bit signed range (-2,147,483,648 to 2,147,483,647).
   - Date.now() returns ~1.7 trillion → REJECT if assigned to any integer column.
   - sort_order must use monotonic counter (existingItems.length), not timestamp.

4. NETLIFY SERVERLESS RULES
   - cookieStore.set() throws in Netlify serverless outside mutation context. setAll callbacks MUST wrap set() in try/catch.

5. NEXT.JS APP ROUTER RULES
   - 'use server' files must only export async functions.
   - Server Components cannot use hooks (useState, useEffect, etc.).
   - Client Components must not pass server actions to non-serializable contexts (event handlers are fine, queryFn direct reference is not).

6. CROSS-APP CONSISTENCY
   - The desktop app is archived at apps/_archived-thriving-desktop/. Do not flag divergences unless the plan explicitly references porting from the archived app. All new work targets apps/thriving-mobile/ only.

PART B — SCOPE & PLAN FIDELITY

7. PUSHBACK CHECK
   - If the plan has no ## Pushback section → REJECT with "plan missing required ## Pushback section."
   - If the ## Pushback section is empty (no text after the heading) → REJECT with "## Pushback section must not be empty."
   - If ## Pushback contains a concern (anything other than "None") → flag: "Pushback declared — verify human has acknowledged before approving."

8. LESSONS ADDRESSED CHECK
   - If the plan has no ## Lessons Addressed section → REJECT with "plan missing required ## Lessons Addressed section."
   - If the ## Lessons Addressed section is empty → REJECT with "## Lessons Addressed must list applicable lessons or state None applicable."

9. SCOPE
   - Does the change address ONE concern? Unrelated fixes bundled together → REJECT.
   - Scope estimate in the plan: small (1-3 files), medium (4-7), large (8+). If actual file count exceeds the estimate by more than 2 → REJECT with "scope grew beyond plan estimate."

10. PLAN FIDELITY (code review only)
    - Compare changed files in the diff against the plan's "Files to Change" section.
    - If the diff modifies files NOT listed in the plan (excluding test files, config like tsconfig/package.json, CI, and plan files in plans/) → REJECT with "unplanned file change: [filename]."
    - If the plan lists a file with NO changes in the diff, flag it (may indicate incomplete work).

11. DELETION FIDELITY (applies when plan TYPE is REDESIGN or PIPELINE-INFRA)
    - File deletions (git rm) are expected ONLY for files listed in "Files to Delete." Unplanned deletions → REJECT.
    - Files listed in "Files to Delete" that are NOT actually deleted in the diff → REJECT as incomplete work. Note: git may show a delete+create as a "rename" — this still counts as a valid deletion if the old file no longer exists.
    - A FEATURE plan that contains git rm commands → REJECT with "file deletions require TYPE: REDESIGN or PIPELINE-INFRA."

DO NOT reject solely based on file count. A legitimate feature may touch 10+ files if they are all coherent. Judge by coherence, not by a number.

If all checks pass, answer APPROVED.
