// ═══════════════════════════════════════════════════════════
// FILE: goals-page-actions.ts
// PURPOSE: Fetches data for the three drill-down levels of the
//   Goals screen — pillars with progress, goals for a pillar,
//   and tasks for a goal. Returns { data } or { error } so the
//   UI can distinguish "no data" from "something went wrong."
// CALLED BY: hooks/use-goals-drilldown.ts
// DATA FLOW: Hook calls these → server checks auth → @upp/db
//   queries Supabase → returns typed result to the hook
// ═══════════════════════════════════════════════════════════
'use server';

import { getPillarsWithProgress, getGoalsWithProgress, getTasksByGoalWithContext } from '@upp/db';
import type { PillarWithProgress, GoalWithProgress, TaskWithContext } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';

type Result<T> = { data: T } | { error: string };

/**
 * Triggered by: Goals screen mounts (level 1 — pillar list).
 * Steps: gets the logged-in user, fetches all their pillars with
 *   goal counts and task completion progress from @upp/db.
 * Returns: { data: pillars[] } on success, { error } if auth
 *   fails or the query breaks.
 */
export async function fetchPillars(): Promise<Result<PillarWithProgress[]>> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Session expired — please log in again' };
    const data = await getPillarsWithProgress(supabase, user.id);
    return { data };
  } catch {
    return { error: 'Failed to load pillars — try again' };
  }
}

/**
 * Triggered by: user taps a pillar card (level 2 — goal list).
 * Steps: gets the logged-in user, fetches goals for the chosen
 *   pillar with task counts per goal.
 * Returns: { data: goals[] } on success, { error } on failure.
 */
export async function fetchGoalsForPillar(
  pillarId: string,
): Promise<Result<GoalWithProgress[]>> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Session expired — please log in again' };
    const data = await getGoalsWithProgress(supabase, pillarId);
    return { data };
  } catch {
    return { error: 'Failed to load goals — try again' };
  }
}

/**
 * Triggered by: user taps a goal card (level 3 — task list).
 * Steps: gets the logged-in user, fetches tasks for the chosen
 *   goal with full context (goal title, pillar info) so they
 *   can be displayed in TaskSwipeRow.
 * Returns: { data: tasks[] } on success, { error } on failure.
 */
export async function fetchTasksForGoal(
  goalId: string,
): Promise<Result<TaskWithContext[]>> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Session expired — please log in again' };
    const data = await getTasksByGoalWithContext(supabase, goalId);
    return { data };
  } catch {
    return { error: 'Failed to load tasks — try again' };
  }
}
