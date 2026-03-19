'use server';

import { getPillars, getGoals } from '@upp/db';
import type { Goal, LifePillar } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';

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
