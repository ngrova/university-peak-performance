# Agent 3 — Integration Correctness

Reviews every diff for whether components will work correctly together at runtime. This is the #1 source of production bugs in this codebase.

## Checklist

### 1. SUPABASE CLIENT RULES
- Are any server clients using the old `get`/`set`/`remove` cookie pattern instead of the `getAll`/`setAll` API (which must match `middleware.ts`)?
- Is `createServerClient` called directly anywhere instead of using the canonical pattern from `src/lib/supabase-server.ts`?
- Any other concerns related to Supabase client integration?

### 2. TANSTACK QUERY + SERVER ACTION RULES
- Are any server actions passed directly to `queryFn` (`queryFn: myServerAction`) instead of wrapped in an arrow function (`queryFn: () => myServerAction()`)? Direct passing causes AbortSignal serialization failure.
- Does the same problem exist with `useMutation` `mutationFn`?
- Any other concerns related to TanStack Query integration?

### 3. NETLIFY SERVERLESS RULES
- Are any `setAll` callbacks missing try/catch around `cookieStore.set()`? (`cookieStore.set()` throws in Netlify serverless outside mutation context.)
- Any other concerns related to Netlify serverless integration?

### 4. NEXT.JS APP ROUTER RULES
- Do any `'use server'` files export non-async functions?
- Do any Server Components use hooks (`useState`, `useEffect`, etc.)?
- Do any Client Components pass server actions to non-serializable contexts? (Event handlers are fine; `queryFn` direct reference is not.)
- Any other concerns related to Next.js App Router integration?

### 5. RACE CONDITIONS
- Could two users editing the same record concurrently leave data in an inconsistent state? Does optimistic UI fail to reconcile with server state after mutation?
- Are there read-then-write patterns where another request could change the value between the read and the write?
- Any other concerns related to race conditions?

### 6. MIGRATION SAFETY
- Could this migration lock a large table for an extended period? (Adding a column with a default to a large table can lock it.)
- Is the migration destructive (drops columns, renames, changes types) without an explicit rollback path?
- Does the migration mismatch what the code expects — referencing columns the migration doesn't create, or creating columns the code doesn't reference?
- Any other concerns related to migration safety?

### FINAL: Any other integration correctness concerns not covered by the checks above?
