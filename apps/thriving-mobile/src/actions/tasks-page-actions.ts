'use server';

import { getAllTasksWithContext, deleteTask } from '@upp/db';
import type { TaskWithContext } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

/** Fetches all tasks for the current user with goal/pillar context */
export async function fetchAllTasks(): Promise<TaskWithContext[]> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return getAllTasksWithContext(supabase, user.id);
}

/** Deletes a task by ID */
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
