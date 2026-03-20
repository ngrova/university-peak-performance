// ═══════════════════════════════════════════════════════════
// FILE: use-tree-drilldown.ts
// PURPOSE: Manages the Tree screen's four-level drill-down state
//   (pillars → goals → task chain → fork tracks) and processes
//   the tree data into the correct shape for each level.
// CALLED BY: components/TreeContent.tsx
// DATA FLOW: TreeContent calls this hook → hook fetches all tree
//   data once via TanStack Query → filters/builds chains based
//   on which level the user has drilled into
// ═══════════════════════════════════════════════════════════
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { LifePillar, Goal, Task } from '@upp/db';
import { fetchTreeData } from '@/actions/tree-actions';
import { buildChain, buildForkTrack } from '@/lib/build-chain';
import type { ChainNode } from '@/lib/build-chain';
import type { BreadcrumbItem } from '@/types/breadcrumb';

/** Unwraps { data } | { error } from server actions, throwing on error */
async function unwrap<T>(fn: () => Promise<{ data: T } | { error: string }>): Promise<T> {
  const result = await fn();
  if ('error' in result) throw new Error(result.error);
  return result.data;
}

/** Manages which pillar/goal/fork the user has drilled into */
function useTreeNav() {
  const [pillarId, setPillarId] = useState<string | null>(null);
  const [pillarName, setPillarName] = useState('');
  const [goalId, setGoalId] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [forkTaskId, setForkTaskId] = useState<string | null>(null);
  const [forkLabel, setForkLabel] = useState('');

  const level = forkTaskId ? 'fork' : goalId ? 'chain' : pillarId ? 'goals' : 'pillars';

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Tree', level: 'pillars' }];
  if (pillarId) breadcrumbs.push({ label: pillarName, level: 'goals', id: pillarId });
  if (goalId) breadcrumbs.push({ label: goalTitle, level: 'chain', id: goalId });
  if (forkTaskId) breadcrumbs.push({ label: forkLabel, level: 'fork', id: forkTaskId });

  const drillPillar = useCallback((id: string, name: string) => {
    setPillarId(id); setPillarName(name); setGoalId(null); setForkTaskId(null);
  }, []);
  const drillGoal = useCallback((id: string, title: string) => {
    setGoalId(id); setGoalTitle(title); setForkTaskId(null);
  }, []);
  const drillFork = useCallback((id: string, label: string) => {
    setForkTaskId(id); setForkLabel(label);
  }, []);

  const navigateTo = useCallback((target: string) => {
    if (target === 'pillars') { setPillarId(null); setGoalId(null); setForkTaskId(null); }
    if (target === 'goals') { setGoalId(null); setForkTaskId(null); }
    if (target === 'chain') { setForkTaskId(null); }
  }, []);

  return {
    level, breadcrumbs, pillarId, goalId, forkTaskId,
    drillPillar, drillGoal, drillFork, navigateTo,
  };
}

/**
 * Triggered by: TreeContent mounts this hook on render.
 * Steps: fetches all tree data once, uses navigation state to
 *   filter pillars/goals and build task chains for the current level.
 * Returns: { level, breadcrumbs, pillars, goals, chain, nav, ... }
 */
export function useTreeDrilldown() {
  const qc = useQueryClient();
  const nav = useTreeNav();

  // CAUTION: Arrow wrapper required on ALL server action queryFn calls
  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['tree-data'],
    queryFn: () => unwrap(() => fetchTreeData()),
  });

  const pillars = tree?.pillars ?? [];
  const allGoals = tree?.goals ?? [];
  const allTasks = tree?.tasks ?? [];

  /** Goals for the selected pillar, with task counts */
  const goals = useMemo(() => {
    if (!nav.pillarId) return [];
    return allGoals.filter((g) => g.pillar_id === nav.pillarId);
  }, [allGoals, nav.pillarId]);

  /** Task chain for the selected goal (or fork track) */
  const chain: ChainNode[] = useMemo(() => {
    if (!nav.goalId) return [];
    const goalTasks = allTasks.filter((t) => t.goal_id === nav.goalId);
    if (nav.forkTaskId) return buildForkTrack(goalTasks, nav.forkTaskId);
    return buildChain(goalTasks);
  }, [allTasks, nav.goalId, nav.forkTaskId]);

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['tree-data'] });
  }, [qc]);

  return { ...nav, pillars, goals, allGoals, allTasks, chain, isLoading, error, refresh };
}
