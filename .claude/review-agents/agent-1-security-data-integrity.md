# Agent 1 — Security & Data Integrity

Reviews every diff for security vulnerabilities and data integrity risks in the Next.js + Supabase + Netlify stack.

## Checklist

### 1. SUPABASE QUERY SAFETY
- Is any query using `.select('*')` instead of listing explicit columns? (Note: `.select('*, relation(col1, col2)')` counts — the top-level `*` is the problem.)
- Is any list query missing `.limit()` — returning an unbounded array without `.limit(N)` or a unique key scope (`.eq('id', ...)` + `.single()`)?
- Any other concerns related to Supabase query safety?

### 2. RLS AND AUTH
- Are any tables touched by this diff missing RLS or missing policies that filter by `auth.uid()`?
- Is any server action missing a `supabase.auth.getUser()` call, or failing to handle the `!user` case before database operations?
- Can a user pass another user's ID to modify or read their data? Do any server actions trust client-sent user IDs for authorization instead of using the authenticated user's ID from `getUser()`?
- Does the `service_role` key appear in any client-side code or files under `src/components/`, `src/app/(app)/`, or any file with `'use client'`?
- Any other concerns related to RLS and auth?

### 3. FORBIDDEN PATTERNS
- Does the diff contain `dangerouslySetInnerHTML`?
- Does the diff contain `eval()` or `new Function()`?
- Does the diff contain raw SQL string concatenation?
- Does the diff contain `console.log/warn/error/debug` in app code? (Exception: `scripts/` directories, test files, `.github/` scripts.)
- Does the diff contain hardcoded secrets, API keys, or Supabase URLs as string literals instead of `process.env` references?
- Any other concerns related to forbidden patterns?

### 4. ENVIRONMENT VARIABLE SAFETY
- Does `SUPABASE_SERVICE_ROLE_KEY` appear in any client-side file (components, `'use client'` files)?
- Are any non-`NEXT_PUBLIC_` env vars referenced in client-side code?
- Any other concerns related to environment variable safety?

### 5. VALUE-TO-COLUMN COMPATIBILITY
- Could any number being INSERTed or UPDATEd into an integer column exceed 2,147,483,647? (PostgreSQL integer columns max at 2,147,483,647. `Date.now()` returns ~1.7 trillion — check `sort_order`, `priority`, and any integer column.)
- Are any string values going into columns with CHECK constraints that could violate those constraints?
- Any other concerns related to value-to-column compatibility?

### 6. SILENT FAILURE DETECTION
- Could any auth or permission check fail silently — returning empty data (`[]`, `null`) instead of an error, making it impossible for the UI to distinguish "no data" from "access denied"?
- Are any catch blocks silently returning `{}` or `[]` without logging, hiding the real error from both the user and Sentry?
- Is `error` from any Supabase `{ data, error }` response being ignored — not destructured, or destructured but never checked?
- Do any mutations return the same shape (`{}`) on both success and error, making them indistinguishable to the UI?
- Any other concerns related to silent failure detection?

### 7. DUPLICATE PREVENTION & DATA PRESERVATION
- Are any mutation-triggering buttons missing `disabled={isPending}` or equivalent, allowing double-submission?
- Is any record-creating mutation missing a UNIQUE constraint or idempotency check that would prevent duplicates on retry?
- Does any form clear the user's typed data on mutation failure instead of preserving it?
- Any other concerns related to duplicate prevention and data preservation?

### 8. SCHEMA CHANGES
- Are there any new tables, columns, constraints, or indexes without a corresponding migration file in `supabase/migrations/`? Any dashboard-only changes without migrations?
- Any other concerns related to schema changes?

### 9. SERVER ACTION EXPOSURE
- Is any function exported from a `'use server'` file that is NOT being treated as a publicly callable API endpoint? (Every export is callable regardless of whether any component imports it.)
- Is any exported server action missing its own auth check (`getUser()`) or its own ownership verification — relying on the calling component for security?
- Does any server action accept an ID parameter (`userId`, `sessionId`, `buildId`) without verifying the authenticated user owns that resource? Could an attacker call it directly with someone else's ID?
- Are there any dead server actions (exported but not imported by any component) that use admin/service-role clients? These are live attack surface even if unused.
- Any other concerns related to server action exposure?

### 10. SERVER-SIDE VALIDATION
- Is any client-side validation (minLength, maxLength, regex, required fields, format checks) missing matching server-side enforcement in the corresponding server action? (Client validation is UX; server validation is security.)
- Are password minimum length, email format, file size limits, or numeric ranges missing server-side validation?
- Any other concerns related to server-side validation?

### 11. SECURITY PATTERN CONSISTENCY
- Does the diff add a security pattern (rate limiting, UUID validation, auth check, input sanitization, CSRF protection) to one route or action while similar routes or actions in the CODEBASE SCAN are missing the same pattern?
- Does the scan show similar locations missing the same security pattern? (This catches the "3 of 4 download routes validate UUIDs" class of bugs.)
- Any other concerns related to security pattern consistency?

### 12. OUTPUT INJECTION & DATA LEAKAGE
- Is any user-controlled data flowing into outputs (log lines, emails, API responses, error messages, webhook payloads, notification content) without proper handling?
- Is user-controlled data rendered in HTML (emails, templates) without escaping?
- Is user-controlled data written to logs without sanitization?
- Do any error messages expose system internals (stack traces, database errors, file paths, internal IDs)?
- Do any webhook or notification payloads include raw user data without redaction?
- Any other concerns related to output injection and data leakage?

### FINAL: Any other security or data integrity concerns not covered by the checks above?
