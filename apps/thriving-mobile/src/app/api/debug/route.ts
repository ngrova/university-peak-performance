import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getOneThingTask, getTasksForQueue } from '@upp/db';
import { NextResponse } from 'next/server';

/** Temporary debug route — delete after diagnosing auth issue */
export async function GET() {
  const debug: Record<string, unknown> = {};

  try {
    const cookieStore = await cookies();
    debug.cookieCount = cookieStore.getAll().length;
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
              toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            } catch { /* ignore */ }
          },
        },
      },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    debug.userId = userData?.user?.id ?? null;
    debug.userError = userError?.message ?? null;

    if (userData?.user) {
      // Test 1: simple query (already proven to work)
      const { data: simple, error: simpleErr } = await supabase
        .from('tasks')
        .select('id, title, status')
        .eq('user_id', userData.user.id)
        .limit(5);
      debug.simpleCount = simple?.length ?? 0;
      debug.simpleError = simpleErr?.message ?? null;

      // Test 2: JOIN query — same CONTEXT_SELECT as @upp/db
      const contextSelect = '*, goals(title, pillar_id, priority_rank, life_pillars(id, name, color, icon))';
      const { data: joined, error: joinErr } = await supabase
        .from('tasks')
        .select(contextSelect)
        .eq('user_id', userData.user.id)
        .neq('status', 'done')
        .limit(5);
      debug.joinCount = joined?.length ?? 0;
      debug.joinError = joinErr?.message ?? null;
      debug.joinSample = joined?.slice(0, 2) ?? [];

      // Test 3: call actual @upp/db functions
      try {
        const oneThing = await getOneThingTask(supabase, userData.user.id);
        debug.oneThingTitle = oneThing?.title ?? null;
        debug.oneThingError = null;
      } catch (e) {
        debug.oneThingTitle = null;
        debug.oneThingError = e instanceof Error ? e.message : String(e);
      }

      try {
        const queue = await getTasksForQueue(supabase, userData.user.id);
        debug.queueCount = queue.length;
        debug.queueError = null;
      } catch (e) {
        debug.queueCount = 0;
        debug.queueError = e instanceof Error ? e.message : String(e);
      }
    }
  } catch (e) {
    debug.error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(debug);
}
