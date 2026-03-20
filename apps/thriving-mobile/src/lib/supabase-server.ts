import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// CAUTION: Must use getAll/setAll, NOT get/set/remove — Netlify serverless
// silently drops individual cookie operations. See .claude/rules/platform-traps.md
/** Creates a Supabase server client with getAll/setAll — same API as middleware */
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
