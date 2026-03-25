Review this code diff for security issues in this Next.js + Supabase + Netlify stack.

Your response MUST start with exactly one word on the first line: APPROVED, WARN, or REJECTED.
- Use APPROVED if no issues exist in lines added by this diff (lines starting with +).
- Use WARN if the only issues are pre-existing (visible in context lines, not added by this PR). List them but they do not block.
- Use REJECTED only for issues in lines the PR author actually added.
Then explain your reasoning below.

Checklist — applies only to lines ADDED by this diff:

1. SUPABASE QUERY SAFETY
   - Any .select('*') → REJECT. Must list explicit columns.
     Note: .select('*, relation(col1, col2)') also counts — the top-level * is the problem.
   - Any list query missing .limit() → REJECT. All queries returning arrays must have .limit(N) or be scoped by a unique key (.eq('id', ...) + .single()).

2. RLS AND AUTH
   - Tables must have RLS enabled with policies filtering by auth.uid().
   - Server actions must call supabase.auth.getUser() and handle the !user case BEFORE any database operation.
   - Can a user pass another user's ID to modify/read their data? Server actions must never trust client-sent user IDs for authorization — always use the authenticated user's ID from getUser().
   - service_role key must never appear in client-side code or files under src/components/, src/app/(app)/, or any file with 'use client'.

3. FORBIDDEN PATTERNS
   - dangerouslySetInnerHTML → REJECT.
   - eval() or new Function() → REJECT.
   - Raw SQL string concatenation → REJECT.
   - console.log/warn/error/debug in app code → REJECT. Use Sentry. Exception: scripts/ directories and test files.
   - Hardcoded secrets, API keys, or Supabase URLs as string literals (not process.env) → REJECT.

4. ENVIRONMENT VARIABLE SAFETY
   - SUPABASE_SERVICE_ROLE_KEY must only appear in server-side files (API routes, 'use server' files, middleware).
   - NEXT_PUBLIC_ variables are OK in any file.

5. SILENT AUTH FAILURE
   - Could any auth or permission check fail silently (returning empty data instead of an error)? If a server action returns [] or null when auth fails, the UI cannot distinguish "no data" from "access denied" — flag it.

If all checks pass, answer APPROVED.
