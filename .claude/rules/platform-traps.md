# Platform Traps — Patterns Where the Obvious Code Is Wrong

These are hard-won lessons from production incidents. The "wrong" code looks correct
and passes type checks but fails silently in our deployment environment (Netlify
serverless + PostgreSQL + Next.js App Router).

Read this file before writing ANY code.

## Supabase Server Client (Incident: silent auth failure)

WRONG:
  createServerClient({ get: (name) => cookieStore.get(name)?.value, set: () => {}, remove: () => {} })

RIGHT:
  createServerClient(url, key, { cookies: { getAll: () => cookieStore.getAll(), setAll: (toSet) => { try { toSet.forEach(...) } catch {} } } })

WHY: Netlify serverless requires getAll/setAll. The get/set/remove API silently fails — auth works locally but breaks in production.
CANONICAL: apps/web/src/lib/supabase-server.ts

## TanStack Query + Server Actions (Incident: silent empty data)

WRONG: queryFn: fetchMyData
RIGHT: queryFn: () => fetchMyData()

WHY: TanStack Query passes { queryKey, signal, meta } to queryFn. The signal is an AbortSignal — not serializable across the RSC boundary. The server action silently fails and returns undefined.

## sort_order Column — int4 Overflow (Incident: silent INSERT failure)

WRONG: sort_order: Date.now()
RIGHT: sort_order: existingItems.length

WHY: PostgreSQL int4 max is 2,147,483,647. Date.now() returns ~1.7 trillion. The INSERT silently fails.

## Server Action Return Shape (Pattern: no throwing)

WRONG: throw new Error('Failed to save')
RIGHT: return { error: 'Failed to save — try again' }

WHY: Server actions that throw break the RSC client transport. Always return { error?: string }.

## Supabase Query Safety (Enforced by review agents)

WRONG: .select('*')
RIGHT: .select('id, title, status, goal_id, ...')

WRONG: .from('tasks').order('created_at')  // no limit
RIGHT: .from('tasks').order('created_at').limit(50)

## Console Logging (Enforced by review agents)

WRONG: console.log(data)    console.error(err)
RIGHT: captureException(err) via Sentry

WHY: console.log is invisible in Netlify production. Errors must go to Sentry.

## Server Action Exposure (Incident: IDOR vulnerability)

WRONG: Assuming a server action is "internal" because no component imports it
RIGHT: Every export from a 'use server' file is a live, publicly callable API endpoint

WHY: Next.js silently exposes every export from 'use server' files as callable endpoints. An attacker can call any exported function directly, bypassing your UI's auth checks. A "dead" server action that uses the admin Supabase client is a live privilege escalation vector.
BREAKS IF: You export a function from a 'use server' file without its own auth + ownership checks, or you leave dead exports that use service-role access.

## Client-Side-Only Validation (Incident: password bypass)

WRONG: Enforcing password minimum length only in the form component
RIGHT: Enforce the same constraint in both the form AND the server action

WHY: Client-side validation is UX — it gives the user instant feedback. Server-side validation is security — it prevents bypass. An attacker can call the server action directly with any payload. If the server doesn't validate, the constraint doesn't exist.
BREAKS IF: You add minLength, maxLength, regex, or required checks in a form without matching validation in the corresponding server action.
