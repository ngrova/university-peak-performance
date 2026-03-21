// ═══════════════════════════════════════════════════════════
// FILE: today-actions.ts
// PURPOSE: Fetches the three sections of the Today screen — the
//   "One Thing" focus task, the priority queue, and overdue/due-today
//   tasks. Runs on the server so the database stays protected.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: TodayContent calls these → server checks who's logged
//   in → resolves acting_as delegation → @upp/db queries Supabase
//   for the target user → returns task data to the UI
// ═══════════════════════════════════════════════════════════
'use server';

import { getOneThingTask, getTasksForQueue, getTasksWithDeadlines } from '@upp/db';
import type { TaskWithContext } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';

/**
 * Triggered by: TodayContent mounts and TanStack Query runs this.
 * Steps: gets the logged-in user, resolves delegation context, then
 *   asks @upp/db for the target user's pinned "One Thing" task.
 * Returns: a single task with goal context, or null if none found.
 */
export async function fetchOneThing(): Promise<TaskWithContext | null> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const targetUserId = await getActingAsUserId(supabase, user.id);
  return getOneThingTask(supabase, targetUserId);
}

/**
 * Triggered by: TodayContent mounts and TanStack Query runs this.
 * Steps: gets the logged-in user, resolves delegation context, then
 *   asks @upp/db for the target user's active tasks ordered by priority.
 * Returns: array of tasks with goal context, or empty array if
 *   not logged in.
 */
export async function fetchQueue(): Promise<TaskWithContext[]> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const targetUserId = await getActingAsUserId(supabase, user.id);
  return getTasksForQueue(supabase, targetUserId);
}

/**
 * Triggered by: TodayContent mounts and TanStack Query runs this.
 * Steps: gets the logged-in user, resolves delegation context, then
 *   asks @upp/db for the target user's tasks with deadlines.
 * Returns: array of tasks with goal context, or empty array if
 *   not logged in.
 */
export async function fetchDeadlineTasks(): Promise<TaskWithContext[]> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const targetUserId = await getActingAsUserId(supabase, user.id);
  return getTasksWithDeadlines(supabase, targetUserId);
}
