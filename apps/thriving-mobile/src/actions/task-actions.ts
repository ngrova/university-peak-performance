// ═══════════════════════════════════════════════════════════
// FILE: task-actions.ts
// PURPOSE: Handles creating, completing, and editing individual
//   tasks. These run on the server when a user taps buttons in
//   the app — like "Add", "Complete", or changing a task's title.
// CALLED BY: components/CaptureSheet.tsx, components/TaskRow.tsx,
//   components/TaskActions.tsx, components/TaskDetailSheet.tsx,
//   components/TaskSwipeRow.tsx
// DATA FLOW: User action in UI → server action here → @upp/db
//   writes to Supabase → revalidates cached pages
// ═══════════════════════════════════════════════════════════
'use server';

import { createTask, updateTask, getTasksByGoal } from '@upp/db';
import type { TaskAssignee, FailureCost } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';
import { revalidatePath } from 'next/cache';

interface CaptureInput {
  title: string;
  goal_id?: string | null;
  due_date?: string;
  priority?: 1 | 2 | 3 | 4;
  assignee?: TaskAssignee;
  notes?: string;
  failure_cost?: FailureCost;
}

/**
 * Triggered by: user taps "Add" in the capture bottom sheet.
 * Steps: checks the user is logged in, resolves delegation context,
 *   counts existing tasks under the chosen goal to set sort order,
 *   then inserts the new task under the target user's account.
 * Returns: empty object on success, or { error: message } if
 *   something went wrong (shown to the user in the sheet).
 */
export async function captureTask(input: CaptureInput): Promise<{ taskId?: string; error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    const targetUserId = await getActingAsUserId(supabase, user.id);
    // Coerce empty string to null — GoalPicker sends '' for "no goal"
    const goalId = input.goal_id || null;
    // Sort order: count siblings under the same goal, or 0 for unsorted tasks
    const sortOrder = goalId ? (await getTasksByGoal(supabase, goalId)).length : 0;
    const taskInput: Parameters<typeof createTask>[2] = {
      goal_id: goalId,
      title: input.title,
      // CAUTION: sort_order is int4 (max 2.1B) — use array.length, NEVER Date.now()
      sort_order: sortOrder,
    };
    if (input.due_date) taskInput.due_date = input.due_date;
    if (input.priority) taskInput.priority = input.priority;
    if (input.assignee) taskInput.assignee = input.assignee;
    if (input.notes) taskInput.notes = input.notes;
    if (input.failure_cost) taskInput.failure_cost = input.failure_cost;
    const task = await createTask(supabase, targetUserId, taskInput);
    revalidatePath('/today');
    return { taskId: task.id };
  } catch {
    return { error: 'Failed to save — try again' };
  }
}

/**
 * Triggered by: user swipes right on a task or taps "Complete" in detail sheet.
 * Steps: connects to Supabase, sets the task's status to "done" and
 *   records the current time as completed_at, then refreshes the page.
 * Returns: empty object on success, or { error: message } on failure.
 */
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

/**
 * Triggered by: user edits a field in the task detail sheet (title,
 *   deadline, notes, or status) — fires on blur or change.
 * Steps: connects to Supabase, updates the single field on the task
 *   row, then refreshes the Today screen cache.
 * Returns: empty object on success, or { error: message } on failure.
 */
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
