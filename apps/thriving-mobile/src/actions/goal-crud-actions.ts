// ═══════════════════════════════════════════════════════════
// FILE: goal-crud-actions.ts
// PURPOSE: Server actions for creating, editing, and archiving
//   goals. Each action auto-saves a single change so the UI can
//   fire updates on blur without a save button.
// CALLED BY: components/GoalEditSheet.tsx, components/AddGoalButton.tsx
// DATA FLOW: UI event (blur, tap) → server action here → @upp/db
//   writes to Supabase → revalidates cached pages → UI refreshes
// ═══════════════════════════════════════════════════════════
'use server';

import { createGoal, updateGoal, getGoals } from '@upp/db';
import type { Goal } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';
import { reportError } from '@/lib/report-error';
import { revalidatePath } from 'next/cache';

/**
 * Triggered by: user taps "Add" in the AddGoalButton component.
 * Steps: checks auth, resolves delegation, counts existing goals
 *   for sort_order (monotonic counter), inserts the new goal.
 * Returns: empty object on success, or { error } with message.
 */
export async function createGoalAction(
  pillarId: string,
  title: string,
): Promise<{ goalId?: string; error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    const targetUserId = await getActingAsUserId(supabase, user.id);
    // CAUTION: sort_order is int4 — use array.length, NEVER Date.now()
    const existing = await getGoals(supabase, pillarId);
    const goal = await createGoal(supabase, targetUserId, {
      pillar_id: pillarId,
      title,
      sort_order: existing.length,
    });
    revalidatePath('/goals');
    return { goalId: goal.id };
  } catch (err) {
    reportError(err);
    return { error: 'Failed to create goal — try again' };
  }
}

type GoalField = keyof Pick<Goal, 'title' | 'description' | 'target_date' | 'status' | 'color' | 'priority_rank' | 'pillar_id'>;

/**
 * Triggered by: user edits a field in GoalEditSheet (fires on blur/change).
 * Steps: connects to Supabase, updates the single field on the goal
 *   row, then refreshes the Goals screen cache.
 * Returns: empty object on success, or { error } with message.
 */
export async function updateGoalField(
  goalId: string,
  field: GoalField,
  value: string | number | null,
): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    await updateGoal(supabase, goalId, { [field]: value });
    revalidatePath('/goals');
    return {};
  } catch (err) {
    reportError(err);
    return { error: 'Failed to save — try again' };
  }
}

/**
 * Triggered by: user taps "Archive" in the GoalEditSheet.
 * Steps: connects to Supabase, sets the goal's status to 'archived',
 *   which hides it and its tasks from active views.
 * Returns: empty object on success, or { error } with message.
 */
export async function archiveGoal(
  goalId: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    await updateGoal(supabase, goalId, { status: 'archived' });
    revalidatePath('/goals');
    return {};
  } catch (err) {
    reportError(err);
    return { error: 'Failed to archive — try again' };
  }
}
