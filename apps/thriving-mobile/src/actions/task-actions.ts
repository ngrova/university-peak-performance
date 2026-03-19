'use server';

import { createTask, updateTask, getPillars, getGoals } from '@upp/db';
import type { Goal, LifePillar } from '@upp/db';
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
    const goalId = input.goal_id;
    if (!goalId) return { error: 'Select a goal for this task' };
    const taskInput: Parameters<typeof createTask>[2] = {
      goal_id: goalId,
      title: input.title,
      sort_order: Date.now(),
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

/** Fetches all goals grouped by pillar for the goal picker */
export async function fetchGoalsForPicker(): Promise<{ pillars: LifePillar[]; goals: Goal[] }> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pillars: [], goals: [] };
  const pillars = await getPillars(supabase, user.id);
  const allGoals: Goal[] = [];
  for (const pillar of pillars) {
    const goals = await getGoals(supabase, pillar.id);
    allGoals.push(...goals);
  }
  return { pillars, goals: allGoals };
}
