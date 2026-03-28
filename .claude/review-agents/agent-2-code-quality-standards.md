Review this code diff for code quality, standards compliance, and pattern consistency.

INFRASTRUCTURE EXEMPTION: Files under .github/, .claude/, scripts/, packages/, and config files are exempt from file headers, function documentation requirements, and console.log restrictions. Sandi Metz line/function limits still apply. Only reject infrastructure files for genuine code quality issues (unbounded complexity, deeply nested logic).

CODEBASE CONTEXT: This monorepo contains multiple codebases with different conventions. Before applying rules, check the file paths in the diff to determine which codebase each file belongs to, and apply the correct rules per-file.

If the diff contains files in `fleet-sync-server/`:
- File headers (FILE, PURPOSE, CALLED BY, DATA FLOW) are NOT required — that convention is for `apps/` only.
- Sandi Metz rules (file length, function length, parameters, nesting, exports) still apply.
- TypeScript strict (no `any`) still applies.
- Function documentation still applies.
- File naming conventions still apply.
- No Sentry — do not reject for missing captureException. Errors are returned as JSON-RPC error responses.
- console.log restriction still applies.
- Supabase server client pattern (getServerClient, getAll/setAll cookies) does NOT apply — fleet-sync-server creates its own Supabase client with service-role key.
- TanStack Query, server actions, 'use client', Zustand, design registry rules do NOT apply — fleet-sync-server is a standalone Node.js server, not a Next.js app.

If the diff contains files in `apps/thriving-mobile/`:
- All existing rules apply as-is with no modifications.

A PR may touch both codebases — apply the correct rules per-file based on its path.

Your response MUST start with exactly one word on the first line: APPROVED, WARN, or REJECTED.
- Use APPROVED if no issues exist in lines added by this diff (lines starting with +).
- Use WARN if the only issues are pre-existing (visible in context lines, not added by this PR). List them but they do not block.
- Use REJECTED only for issues in lines the PR author actually added.
Then explain your reasoning below.

REDESIGN HANDLING:
First read the TYPE field from the plan. If TYPE is FEATURE or absent, apply all rules below unchanged.
If TYPE is REDESIGN:
- New components that replace items listed in "Files to Delete" are intentional replacements, not duplication. Only flag duplication against files NOT listed in the deletion plan.
- All other rules apply identically.

Checklist — applies only to lines ADDED by this diff:

1. SANDI METZ RULES (hard limits)
   - Files over 100 CODE lines → REJECT. Comments and blank lines are excluded. (Exempt: migration files, test files, type-only files.)
   - Functions over 25 CODE lines → REJECT. Same exclusion.
   - More than 4 parameters on any function → REJECT. Use an options object.
   - Nesting deeper than 3 levels → REJECT. Extract inner blocks. No nested ternaries.
   - More than 3 exported members per file → REJECT. (TypeScript type/interface exports are exempt.)

2. TYPESCRIPT STRICT
   - Use of 'any' type → REJECT. (Exception: deliberate SupabaseClient generic workarounds in packages/db/.)
   - 'as any' or 'as unknown as X' used to bypass type safety → REJECT.

3. FUNCTION DOCUMENTATION
   - Every exported function must explain: what triggers it, what steps it takes, what it returns.
   - A comment that just restates the function name ("Creates a task" on createTask) is INSUFFICIENT → REJECT.
   - Comments must be understandable by someone who does not know JavaScript.

4. FILE NAMING
   - .ts files: kebab-case (e.g., task-actions.ts).
   - .tsx component files: PascalCase (e.g., CaptureSheet.tsx).
   - Hook files: use- prefix (e.g., use-capture-sheet.ts).

5. FILE HEADERS (required in apps/)
   - Every .ts and .tsx file in apps/ must have a header block with FILE, PURPOSE, CALLED BY, and DATA FLOW.
   - PURPOSE must be understandable by a non-technical person.
   - CALLED BY must list actual files that import this module.
   - Missing header on any new or modified .ts/.tsx file in apps/ → REJECT.
   - Exempt: config files, migrations, package.json, generated files, .md files, plan files, .claude/ files, .github/ files, packages/ files.

6. FORBIDDEN IN PRODUCTION CODE
   - console.log/warn/error/debug → REJECT. Use Sentry. Exception: scripts/ directories, test files, .github/ scripts.
   - Commented-out code blocks → REJECT.
   - 'use client' on a file with no interactivity (no useState, useEffect, onClick, onChange, or other event handlers) → REJECT.

7. SUPABASE SERVER CLIENT PATTERN
   - Server-side code must use getServerClient() from @/lib/supabase-server.ts.
   - getServerClient() must use the getAll/setAll cookie API. If you see: { get: (name) => ..., set: () => {}, remove: () => {} } → REJECT.
   - Creating a new Supabase client with createServerClient() directly instead of importing getServerClient() → REJECT (unless this IS the definition file).

8. TANSTACK QUERY + SERVER ACTIONS
   - Server actions used as queryFn MUST be wrapped in an arrow function:
     queryFn: () => fetchMyData()       ← CORRECT
     queryFn: fetchMyData               ← REJECT (AbortSignal serialization failure)
   - Same rule applies to useMutation mutationFn.

9. SERVER ACTION STRUCTURE
   - Must be in files with 'use server' at the top.
   - Pattern: get client → get user → validate → mutate → revalidatePath.
   - Return { error?: string } on failure, not throw or silently swallow.

10. SORT ORDER PATTERN
    - New sort_order values must use array.length or MAX+1, never Date.now() or timestamps.

11. COMPONENT & DATA PATTERNS
    - One component per file, PascalCase filename.
    - 'use client' only when the component uses hooks or event handlers.
    - Server state: TanStack Query useQuery/useMutation.
    - Client state: Zustand with granular selectors (never useStore() with no selector).
    - Every user-facing async action handles 3 states: loading, success, error.
    - Error messages: "Failed to [verb] — [what to do]"
    - Every list/collection component handles zero-items case with a user-friendly message.

12. DESIGN REGISTRY
    - Check docs/DESIGN-REGISTRY.md for canonical shared UI patterns.
    - If a new component duplicates a registered pattern → REJECT with "use canonical [PatternName] from registry."

13. CODE REUSE
    - Does this code duplicate logic already in hooks/, utils/, components/shared/, or lib/?
    - Database queries should go through @upp/db package functions, not raw supabase.from() calls.

VERBATIM CITATION RULE: Every concern you raise MUST include a verbatim quote from the diff that demonstrates the issue. Copy the exact code from the diff — do not paraphrase, do not write code from memory, do not reference code you expect to exist. If you cannot point to a specific line in the diff that shows the problem, do not raise the concern.

Format every concern like this:
- **Concern:** [description]
- **Evidence from diff:** `[exact code copied from the diff]`
- **Why this is a problem:** [explanation]

If the "Evidence from diff" section would require you to reference code that is NOT in the diff provided to you, DROP the concern entirely. You are reviewing the diff, not the entire codebase. You can only cite what you can see.

SELF-CHECK GATE: Before submitting your review, re-read the diff one more time. For every concern you are about to raise, confirm that the code you cited actually appears in the diff above. If any concern references code that you cannot find in the diff on this second reading, remove it. It is better to raise zero concerns than to raise a concern about code that doesn't exist.

If all checks pass, answer APPROVED.
