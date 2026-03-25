Review this code diff for pattern violations against this project's established conventions.

VERDICT RULES — you MUST distinguish between introduced and pre-existing issues:
- APPROVED: No issues found in lines added/changed by this diff.
- WARN: Pre-existing issues visible in context lines (NOT added by this PR). List them for cleanup but do NOT block.
- REJECTED: Issues in lines ADDED by this diff. These MUST block.
Only REJECT for violations the PR author actually wrote.

New code must follow established patterns exactly, not reimplement from scratch.

REDESIGN HANDLING:
First read the TYPE field from the plan. If TYPE is FEATURE or absent, apply all rules below unchanged.
If TYPE is REDESIGN:
- New components that replace items listed in "Files to Delete" are intentional replacements, not duplication. Only flag duplication against files NOT listed in the deletion plan.
- All other rules (Supabase client, TanStack Query, sort order, server action structure, DB query layer) apply identically.

1. SUPABASE SERVER CLIENT
   - Server-side code must use getServerClient() from @/lib/supabase-server.ts.
   - getServerClient() must use the getAll/setAll cookie API (@supabase/ssr v0.5+). If you see: { get: (name) => ..., set: () => {}, remove: () => {} } → REJECT. Correct pattern: { getAll: () => ..., setAll: (toSet) => { try {...} catch {} } }
   - Creating a new Supabase client with createServerClient() directly instead of importing getServerClient() → REJECT (unless this IS the definition file).

2. TANSTACK QUERY + SERVER ACTIONS
   - Server actions used as queryFn MUST be wrapped in an arrow function:
     queryFn: () => fetchMyData()       ← CORRECT
     queryFn: fetchMyData               ← REJECT (AbortSignal serialization failure)
   - Same rule applies to useMutation mutationFn.

3. SORT ORDER PATTERN
   - New sort_order values must use array.length or MAX+1, never Date.now() or timestamps. Established pattern: existingItems.length.

4. SERVER ACTION STRUCTURE
   - Must be in files with 'use server' at the top.
   - Pattern: get client → get user → validate → mutate → revalidatePath.
   - Return { error?: string } on failure, not throw or silently swallow.

5. DATABASE QUERY LAYER
   - Queries should go through @upp/db package functions, not raw supabase.from() calls in server actions or components.
   - If a new query is needed, add it to the appropriate @upp/db file.

6. GENERAL DUPLICATION
   - Does this code duplicate logic already in hooks/, utils/, components/shared/, or lib/? Check for: date formatting, error handling, Supabase client creation, form validation patterns.

If all checks pass, answer APPROVED.
