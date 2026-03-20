// ═══════════════════════════════════════════════════════════
// FILE: supabase-server.ts
// PURPOSE: Creates a secure connection to our database that
//   knows which user is logged in. Every server action calls
//   this before reading or writing data.
// CALLED BY: actions/task-actions.ts, actions/today-actions.ts,
//   actions/goal-actions.ts, actions/tasks-page-actions.ts
// DATA FLOW: Next.js cookies → Supabase auth session → authenticated DB client
// ═══════════════════════════════════════════════════════════
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// CAUTION: Must use getAll/setAll, NOT get/set/remove — Netlify serverless
// silently drops individual cookie operations. See .claude/rules/platform-traps.md
/**
 * Triggered by: every server action that needs to read or write data.
 * Steps: reads the browser's login cookies, hands them to Supabase so it
 *   knows which user is making the request, and returns a ready-to-use
 *   database client.
 * Returns: an authenticated Supabase client the caller uses for queries.
 */
export async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            toSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // cookieStore.set() may throw in Netlify serverless — safe to ignore
            // middleware handles token refresh on the next request
          }
        },
      },
    },
  );
}
