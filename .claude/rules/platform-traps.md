# Platform Traps — Patterns Where the Obvious Code Is Wrong

These are hard-won lessons from production incidents. The "wrong" code looks correct
and passes type checks but fails silently in our deployment environment (Netlify
serverless + PostgreSQL + Next.js App Router).

Read this file before writing ANY code in thriving-mobile.

## Supabase Server Client (Incident: silent auth failure)

WRONG:
  createServerClient({ get: (name) => cookieStore.get(name)?.value, set: () => {}, remove: () => {} })

RIGHT:
  createServerClient(url, key, { cookies: { getAll: () => cookieStore.getAll(), setAll: (toSet) => { try { toSet.forEach(...) } catch {} } } })

WHY: Netlify serverless requires getAll/setAll. The get/set/remove API silently fails — auth works locally but breaks in production. Users see empty screens with no error.
BREAKS IF: You import createServerClient from @upp/db (uses wrong cookie API) or create a new client instead of using the shared helper.
CANONICAL: apps/thriving-mobile/src/lib/supabase-server.ts
PLATFORM: Netlify serverless

## TanStack Query + Server Actions (Incident: silent empty data)

WRONG: queryFn: fetchMyData
RIGHT: queryFn: () => fetchMyData()

WRONG: mutationFn: updateMyData
RIGHT: mutationFn: (args) => updateMyData(args)

WHY: TanStack Query passes { queryKey, signal, meta } to queryFn. The signal is an AbortSignal — not serializable across the server/client RSC boundary. The server action call silently fails and returns undefined. The UI shows empty state with no error.
BREAKS IF: You pass any server action directly as queryFn or mutationFn without an arrow wrapper.
CANONICAL: apps/thriving-mobile/src/components/TodayContent.tsx

## sort_order Column — int4 Overflow (Incident: silent INSERT failure)

WRONG: sort_order: Date.now()          // ~1.7 trillion — overflows int4
WRONG: sort_order: Math.random() * 1e9 // unpredictable, can overflow
RIGHT: sort_order: existingItems.length // monotonic counter: 0, 1, 2, 3...

WHY: PostgreSQL int4 max is 2,147,483,647. Date.now() returns ~1,742,000,000,000. The INSERT silently fails with a numeric overflow. The catch block returns "Failed to save" but the real cause is invisible.
BREAKS IF: You use any timestamp-based value or large number for sort_order, priority, or any integer column.
CANONICAL: apps/thriving-mobile/src/actions/task-actions.ts

## Server Action Return Shape (Pattern: no throwing)

WRONG: throw new Error('Failed to save')
RIGHT: return { error: 'Failed to save — try again' }

WHY: Server actions that throw break the RSC client transport. The UI gets an opaque error instead of an actionable message. Always return { error?: string } so the UI can display a user-friendly message.
BREAKS IF: You use throw inside a server action or forget to wrap the body in try/catch.

## Supabase Query Safety (Enforced by 3 review agents)

WRONG: .select('*')
RIGHT: .select('id, title, status, goal_id, ...')

WRONG: .from('tasks').order('created_at')  // no limit — fetches everything
RIGHT: .from('tasks').order('created_at').limit(50)

WHY: Wildcard selects leak new columns and break if schema changes. Unbounded queries kill mobile performance on large tables. Both are enforced by Agents 1, 2, and 7.
BREAKS IF: You use .select('*') anywhere in production code, or omit .limit() on any list query.

## Console Logging (Enforced by 3 review agents)

WRONG: console.log(data)    console.error(err)
RIGHT: captureException(err) via Sentry    // or structured logger in scripts/

WHY: console.log is invisible in Netlify production. Errors must go to Sentry to be discoverable. Enforced by Agents 1, 4, and 7. Exception: scripts/ directories and test files.
