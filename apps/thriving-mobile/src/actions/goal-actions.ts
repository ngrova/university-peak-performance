// ═══════════════════════════════════════════════════════════
// FILE: goal-actions.ts
// PURPOSE: Fetches the user's life pillars and goals so the
//   capture form can show a dropdown of goals to attach a task to.
// CALLED BY: components/GoalPicker.tsx
// DATA FLOW: GoalPicker mounts → calls fetchGoalsForPicker →
//   server checks auth → @upp/db reads pillars + goals from
//   Supabase → returns grouped data to the dropdown
// ═══════════════════════════════════════════════════════════
'use server';

import { getPillars, getGoals } from '@upp/db';
import type { Goal, LifePillar } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';

/**
 * Triggered by: GoalPicker dropdown mounts on the capture sheet.
 * Steps: gets the logged-in user, fetches all their life pillars,
 *   then fetches goals under each pillar and combines them.
 * Returns: { pillars, goals } so the dropdown can group goals
 *   under pillar headings, or empty arrays if not logged in.
 */
export async function fetchGoalsForPicker(): Promise<{ pillars: LifePillar[]; goals: Goal[] }> {
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
}
