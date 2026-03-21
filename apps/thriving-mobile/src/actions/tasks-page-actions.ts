// ═══════════════════════════════════════════════════════════
// FILE: tasks-page-actions.ts
// PURPOSE: Fetches the full task list and handles task deletion
//   for the Tasks screen (the "all tasks" inventory view).
// CALLED BY: components/TasksContent.tsx, components/TaskSwipeRow.tsx
// DATA FLOW: TasksContent loads → fetchAllTasks runs on server →
//   @upp/db queries Supabase → returns tasks with goal context;
//   swipe-left delete → deleteTaskAction → @upp/db removes row
// ═══════════════════════════════════════════════════════════
'use server';

import { getAllTasksWithContext, deleteTask } from '@upp/db';
import type { TaskWithContext } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';
import { revalidatePath } from 'next/cache';

/**
 * Triggered by: TasksContent mounts and TanStack Query runs this.
 * Steps: gets the logged-in user, then asks @upp/db for every task
 *   they own — including which goal and pillar each belongs to.
 * Returns: array of tasks with goal context for the full inventory
 *   view, or empty array if not logged in.
 */
export async function fetchAllTasks(): Promise<TaskWithContext[]> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const targetUserId = await getActingAsUserId(supabase, user.id);
  return getAllTasksWithContext(supabase, targetUserId);
}

/**
 * Triggered by: user confirms deletion after swiping left on a task.
 * Steps: connects to Supabase, deletes the task row, then refreshes
 *   both the Tasks and Today screen caches.
 * Returns: empty object on success, or { error: message } on failure.
 */
export async function deleteTaskAction(taskId: string): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    await deleteTask(supabase, taskId);
    revalidatePath('/tasks');
    revalidatePath('/today');
    return {};
  } catch {
    return { error: 'Failed to delete — try again' };
  }
}
