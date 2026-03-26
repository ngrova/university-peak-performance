Review this code diff for code quality, standards compliance, and pattern consistency.

INFRASTRUCTURE EXEMPTION: Files under .github/, .claude/, scripts/, packages/, and config files are exempt from file headers, function documentation requirements, and console.log restrictions. Sandi Metz line/function limits still apply. Only reject infrastructure files for genuine code quality issues (unbounded complexity, deeply nested logic).

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

If all checks pass, answer APPROVED.
