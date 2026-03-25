Review this code diff for data integrity issues in this Next.js + Supabase stack.

VERDICT RULES — you MUST distinguish between introduced and pre-existing issues:
- APPROVED: No issues found in lines added/changed by this diff.
- WARN: Pre-existing issues visible in context lines (NOT added by this PR). List them for cleanup but do NOT block.
- REJECTED: Issues in lines ADDED by this diff. These MUST block.
Only REJECT for violations the PR author actually wrote.

Checklist — reject if ANY item fails IN ADDED LINES:

1. VALUE-TO-COLUMN COMPATIBILITY
   - For every value being INSERTed or UPDATEd, verify it fits the column type. PostgreSQL integer columns max at 2,147,483,647. Date.now() returns ~1.7 trillion. If a number assigned to sort_order, priority, or any integer column could exceed 2,147,483,647 → REJECT. Use array.length or MAX(col)+1 instead.
   - String values going into columns with CHECK constraints: verify the value satisfies the constraint (e.g., status must be 'todo', 'in_progress', or 'done').

2. SILENT FAILURE DETECTION
   - Server actions that catch errors must return an error message to the caller. A catch block that silently returns {} or [] without logging → REJECT.
   - Supabase queries: if { data, error } is returned but error is not checked → REJECT.
   - Every mutation's success path and error path must return distinguishable shapes — if both return {} the UI cannot tell them apart → flag it.

3. DUPLICATE PREVENTION
   - Mutation-triggering buttons must disable during processing (disabled={isPending} or equivalent).
   - If a mutation creates a record, is there a UNIQUE constraint or idempotency check preventing duplicates on retry?

4. SCHEMA CHANGES
   - Any new table, column, constraint, or index must have a migration file in supabase/migrations/. Dashboard-only changes → REJECT.

5. QUERY SAFETY
   - All list queries have .limit() and explicit .order()? No unbounded, unordered queries on user-facing tables.
   - Explicit column selects (no .select('*') in production code).

6. DATA PRESERVATION
   - User input (form fields, text areas) must not be cleared on error. If a mutation fails, the form should retain the user's typed data.

If all checks pass, answer APPROVED.
