Review this code diff for security and data integrity issues in this Next.js + Supabase + Netlify stack.

INFRASTRUCTURE EXEMPTION: Files under .github/, .claude/, scripts/, and config files are CI/build infrastructure, NOT user-facing application code. Do not apply application security rules (input validation, XSS, SQL injection, secret exposure) to these files. Only reject infrastructure files for actual secrets committed to code.

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
   - Explicit column selects and .limit() on all list queries — no exceptions.

2. RLS AND AUTH
   - Tables must have RLS enabled with policies filtering by auth.uid().
   - Server actions must call supabase.auth.getUser() and handle the !user case BEFORE any database operation.
   - Can a user pass another user's ID to modify/read their data? Server actions must never trust client-sent user IDs for authorization — always use the authenticated user's ID from getUser().
   - service_role key must never appear in client-side code or files under src/components/, src/app/(app)/, or any file with 'use client'.

3. FORBIDDEN PATTERNS
   - dangerouslySetInnerHTML → REJECT.
   - eval() or new Function() → REJECT.
   - Raw SQL string concatenation → REJECT.
   - console.log/warn/error/debug in app code → REJECT. Use Sentry. Exception: scripts/ directories, test files, .github/ scripts.
   - Hardcoded secrets, API keys, or Supabase URLs as string literals (not process.env) → REJECT.

4. ENVIRONMENT VARIABLE SAFETY
   - SUPABASE_SERVICE_ROLE_KEY must only appear in server-side files (API routes, 'use server' files, middleware).
   - NEXT_PUBLIC_ variables are OK in any file.

5. VALUE-TO-COLUMN COMPATIBILITY
   - For every value being INSERTed or UPDATEd, verify it fits the column type. PostgreSQL integer columns max at 2,147,483,647. Date.now() returns ~1.7 trillion. If a number assigned to sort_order, priority, or any integer column could exceed 2,147,483,647 → REJECT. Use array.length or MAX(col)+1 instead.
   - String values going into columns with CHECK constraints: verify the value satisfies the constraint.

6. SILENT FAILURE DETECTION
   - Could any auth or permission check fail silently (returning empty data instead of an error)? If a server action returns [] or null when auth fails, the UI cannot distinguish "no data" from "access denied" — flag it.
   - Server actions that catch errors must return an error message to the caller. A catch block that silently returns {} or [] without logging → REJECT.
   - Supabase queries: if { data, error } is returned but error is not checked → REJECT.
   - Every mutation's success path and error path must return distinguishable shapes — if both return {} the UI cannot tell them apart → flag it.

7. DUPLICATE PREVENTION
   - Mutation-triggering buttons must disable during processing (disabled={isPending} or equivalent).
   - If a mutation creates a record, is there a UNIQUE constraint or idempotency check preventing duplicates on retry?

8. SCHEMA CHANGES
   - Any new table, column, constraint, or index must have a migration file in supabase/migrations/. Dashboard-only changes → REJECT.

9. DATA PRESERVATION
   - User input (form fields, text areas) must not be cleared on error. If a mutation fails, the form should retain the user's typed data.

If all checks pass, answer APPROVED.
