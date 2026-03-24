// ═══════════════════════════════════════════════════════════
// FILE: today-actions.ts
// PURPOSE: Single server action for the Today screen — fetches
//   all active tasks with goal/pillar context. Client-side scoring
//   determines the One Thing and Up Next order.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: TodayContent calls fetchTodayTasks → server checks
//   auth + delegation → @upp/db queries Supabase → returns tasks
// ═══════════════════════════════════════════════════════════
'use server';

import { getAllTasksWithContext } from '@upp/db';
import type { TaskWithContext } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';

/**
 * Triggered by: TodayContent mounts and TanStack Query runs this.
 * Steps: gets the logged-in user, resolves delegation context,
 *   fetches all tasks with goal/pillar context for the target user.
 * Returns: array of tasks with context, or empty array if not signed in.
 */
export async function fetchTodayTasks(): Promise<TaskWithContext[]> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const targetUserId = await getActingAsUserId(supabase, user.id);
  return getAllTasksWithContext(supabase, targetUserId);
}
