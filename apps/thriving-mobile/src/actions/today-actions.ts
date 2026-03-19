'use server';

import { getOneThingTask, getTasksForQueue, getTasksWithDeadlines } from '@upp/db';
import type { TaskWithContext } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';

/** Fetches the One Thing task (pinned or highest-scored) */
export async function fetchOneThing(): Promise<TaskWithContext | null> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getOneThingTask(supabase, user.id);
}

/** Fetches the queue of active tasks sorted by priority */
export async function fetchQueue(): Promise<TaskWithContext[]> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return getTasksForQueue(supabase, user.id);
}

/** Fetches tasks with deadlines for overdue/due-today section */
export async function fetchDeadlineTasks(): Promise<TaskWithContext[]> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return getTasksWithDeadlines(supabase, user.id);
}
