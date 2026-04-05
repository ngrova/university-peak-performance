// ═══════════════════════════════════════════════════════════
// FILE: goal-actions.ts
// PURPOSE: Fetches the user's life pillars and goals so the
//   capture form can show a dropdown of goals to attach a task to.
// CALLED BY: components/GoalPicker.tsx, components/GoalEditSheet.tsx
// DATA FLOW: GoalPicker mounts → calls fetchGoalsForPicker →
//   server checks auth → @upp/db reads pillars + goals from
//   Supabase → returns grouped data to the dropdown
// ═══════════════════════════════════════════════════════════
'use server';

import { getPillars, getGoals } from '@upp/db';
import type { Goal, LifePillar } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';
import { reportError } from '@/lib/report-error';

interface PickerResult { pillars: LifePillar[]; goals: Goal[]; error?: string }

/**
 * Triggered by: GoalPicker, InlineGoalCreate, or GoalEditSheet mounts.
 * Steps: gets the logged-in user, fetches all their life pillars,
 *   then fetches goals under each pillar and combines them. Any
 *   failure is caught, reported to Sentry, and returned as an error.
 * Returns: { pillars, goals } on success; { pillars: [], goals: [] }
 *   when unauthenticated; { pillars: [], goals: [], error } on failure.
 */
export async function fetchGoalsForPicker(): Promise<PickerResult> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { pillars: [], goals: [] };
    const targetUserId = await getActingAsUserId(supabase, user.id);
    const pillars = await getPillars(supabase, targetUserId);
    const allGoals: Goal[] = [];
    for (const pillar of pillars) {
      const goals = await getGoals(supabase, pillar.id);
      allGoals.push(...goals);
    }
    return { pillars, goals: allGoals };
  } catch (err) {
    reportError(err);
    return { pillars: [], goals: [], error: 'Failed to load goals — check your connection and try again' };
  }
}
