Review this code diff for security issues in this Next.js + Supabase + Netlify stack.

VERDICT RULES — you MUST distinguish between introduced and pre-existing issues:
- APPROVED: No issues found in lines added/changed by this diff.
- WARN: Pre-existing issues visible in context lines (lines starting with space in the diff, NOT + or -). These were NOT introduced by this PR. List them for cleanup but do NOT block.
- REJECTED: Issues in lines ADDED by this diff (lines starting with +). These ARE introduced by this PR and MUST block.
Only REJECT for violations the PR author actually wrote. Pre-existing code visible as context is WARN, not REJECT.

Checklist — reject if ANY item fails IN ADDED LINES:

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
