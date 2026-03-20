// ═══════════════════════════════════════════════════════════
// FILE: today-actions.ts
// PURPOSE: Fetches the three sections of the Today screen — the
//   "One Thing" focus task, the priority queue, and overdue/due-today
//   tasks. Runs on the server so the database stays protected.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: TodayContent calls these → server checks who's logged
//   in → @upp/db queries Supabase → returns task data to the UI
// ═══════════════════════════════════════════════════════════
'use server';

import { getOneThingTask, getTasksForQueue, getTasksWithDeadlines } from '@upp/db';
import type { TaskWithContext } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';

/**
 * Triggered by: TodayContent mounts and TanStack Query runs this.
 * Steps: gets the logged-in user, then asks @upp/db for their
 *   pinned "One Thing" task (or the highest-priority one if none pinned).
 * Returns: a single task with goal context, or null if none found.
 */
export async function fetchOneThing(): Promise<TaskWithContext | null> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getOneThingTask(supabase, user.id);
}

/**
 * Triggered by: TodayContent mounts and TanStack Query runs this.
 * Steps: gets the logged-in user, then asks @upp/db for their
 *   active tasks ordered by priority score (the "Up Next" list).
 * Returns: array of tasks with goal context, or empty array if
 *   not logged in.
 */
export async function fetchQueue(): Promise<TaskWithContext[]> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return getTasksForQueue(supabase, user.id);
}

/**
 * Triggered by: TodayContent mounts and TanStack Query runs this.
 * Steps: gets the logged-in user, then asks @upp/db for tasks
 *   that have deadlines (used to show the "Overdue & Due Today" section).
 * Returns: array of tasks with goal context, or empty array if
 *   not logged in.
 */
export async function fetchDeadlineTasks(): Promise<TaskWithContext[]> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return getTasksWithDeadlines(supabase, user.id);
}
