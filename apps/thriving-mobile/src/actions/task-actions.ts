'use server';

import { createTask, updateTask, getTasksByGoal } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

interface CaptureInput {
  title: string;
  goal_id?: string;
  due_date?: string;
  priority?: 1 | 2 | 3 | 4;
}

/** Creates a new task from the capture sheet */
export async function captureTask(input: CaptureInput): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    if (!input.goal_id) return { error: 'Select a goal for this task' };
    const existing = await getTasksByGoal(supabase, input.goal_id);
    const taskInput: Parameters<typeof createTask>[2] = {
      goal_id: input.goal_id,
      title: input.title,
      sort_order: existing.length,
    };
    if (input.due_date) taskInput.due_date = input.due_date;
    if (input.priority) taskInput.priority = input.priority;
    await createTask(supabase, user.id, taskInput);
    revalidatePath('/today');
    return {};
  } catch {
    return { error: 'Failed to save — try again' };
  }
}

/** Marks a task as done with completed_at timestamp */
export async function completeTask(taskId: string): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    await updateTask(supabase, taskId, {
      status: 'done',
      completed_at: new Date().toISOString(),
    });
    revalidatePath('/today');
    return {};
  } catch {
    return { error: 'Failed to complete — try again' };
  }
}

/** Updates a task field (auto-save from detail sheet) */
export async function updateTaskField(
  taskId: string,
  field: string,
  value: string | number | null,
): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    await updateTask(supabase, taskId, { [field]: value });
    revalidatePath('/today');
    return {};
  } catch {
    return { error: 'Failed to save — try again' };
  }
}
