// ═══════════════════════════════════════════════════════════
// FILE: today-actions.ts
// PURPOSE: Server action for the Today screen — fetches all active
//   tasks with goal/pillar context and resolves the current user's
//   assignee name so the client can filter to "my tasks" only.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: TodayContent calls fetchTodayTasks → server checks
//   auth + delegation → @upp/db queries Supabase → resolves the
//   logged-in user's assignee name → returns { tasks, assigneeName }
// ═══════════════════════════════════════════════════════════
'use server';

import { getAllTasksWithContext } from '@upp/db';
import type { TaskWithContext, TaskAssignee } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';
import { resolveAssigneeName } from '@/lib/resolve-assignee-name';

export interface TodayData {
  tasks: TaskWithContext[];
  assigneeName: TaskAssignee | null;
  isDelegate: boolean;
}

/**
 * Triggered by: TodayContent mounts and TanStack Query runs this.
 * Steps: gets the logged-in user, resolves delegation context,
 *   fetches all tasks with goal/pillar context for the target user,
 *   resolves the logged-in user's assignee name for filtering, and
 *   flags whether this request is acting on another account's data.
 * Returns: { tasks, assigneeName, isDelegate } — empty if not signed in.
 */
export async function fetchTodayTasks(): Promise<TodayData> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { tasks: [], assigneeName: null, isDelegate: false };
  const targetUserId = await getActingAsUserId(supabase, user.id);
  const tasks = await getAllTasksWithContext(supabase, targetUserId);
  const assigneeName = resolveAssigneeName(user);
  const isDelegate = targetUserId !== user.id;
  return { tasks, assigneeName, isDelegate };
}
