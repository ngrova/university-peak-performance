import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/** Temporary debug route — delete after diagnosing auth issue */
export async function GET() {
  const debug: Record<string, unknown> = {};

  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    debug.cookieCount = allCookies.length;
    debug.cookieNames = allCookies.map((c) => c.name);
    debug.hasSupabaseCookies = allCookies.some((c) => c.name.includes('supabase'));

    debug.envUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] ? 'set' : 'missing';
    debug.envKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ? 'set' : 'missing';

    const supabase = createServerClient(
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
              debug.setAllError = true;
            }
          },
        },
      },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    debug.userId = userData?.user?.id ?? null;
    debug.userEmail = userData?.user?.email ?? null;
    debug.userError = userError?.message ?? null;

    if (userData?.user) {
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, status')
        .eq('user_id', userData.user.id)
        .limit(5);
      debug.taskCount = tasks?.length ?? 0;
      debug.taskSample = tasks?.map((t) => ({ title: t.title, status: t.status })) ?? [];
      debug.taskError = taskError?.message ?? null;
    }
  } catch (e) {
    debug.error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(debug);
}
