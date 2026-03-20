// ═══════════════════════════════════════════════════════════
// FILE: use-goals-drilldown.ts
// PURPOSE: Manages the Goals screen's three-level drill-down
//   state (pillars → goals → tasks) and fetches data for each
//   level using TanStack Query. Keeps GoalsContent thin.
// CALLED BY: components/GoalsContent.tsx
// DATA FLOW: GoalsContent calls this hook → hook tracks which
//   level is active → fires the right server action via TanStack
//   Query → returns data + navigation functions to the component
// ═══════════════════════════════════════════════════════════
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPillars, fetchGoalsForPillar, fetchTasksForGoal } from '@/actions/goals-page-actions';

export interface BreadcrumbItem {
  label: string;
  level: 'pillars' | 'pillar' | 'goal';
  id?: string;
}

/** Unwraps { data } | { error } from server actions, throwing on error */
async function unwrap<T>(fn: () => Promise<{ data: T } | { error: string }>): Promise<T> {
  const result = await fn();
  if ('error' in result) throw new Error(result.error);
  return result.data;
}

/** Holds which pillar/goal the user has drilled into and builds breadcrumbs */
function useGoalsNav() {
  const [pillarId, setPillarId] = useState<string | null>(null);
  const [pillarName, setPillarName] = useState('');
  const [goalId, setGoalId] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const level = goalId ? 'goal' : pillarId ? 'pillar' : 'pillars';

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Pillars', level: 'pillars' }];
  if (pillarId) breadcrumbs.push({ label: pillarName, level: 'pillar', id: pillarId });
  if (goalId) breadcrumbs.push({ label: goalTitle, level: 'goal', id: goalId });

  const drillIntoPillar = useCallback((id: string, name: string) => {
    setPillarId(id); setPillarName(name); setGoalId(null);
  }, []);

  const drillIntoGoal = useCallback((id: string, title: string) => {
    setGoalId(id); setGoalTitle(title);
  }, []);

  const navigateTo = useCallback((target: 'pillars' | 'pillar') => {
    if (target === 'pillars') { setPillarId(null); setGoalId(null); }
    if (target === 'pillar') { setGoalId(null); }
  }, []);

  return { level, breadcrumbs, pillarId, goalId, drillIntoPillar, drillIntoGoal, navigateTo };
}

/** Invalidates all Goals screen query caches */
function useGoalsRefresh() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: ['pillars'] });
    qc.invalidateQueries({ queryKey: ['goals'] });
    qc.invalidateQueries({ queryKey: ['goal-tasks'] });
  }, [qc]);
}

/**
 * Triggered by: GoalsContent mounts this hook on render.
 * Steps: uses useGoalsNav for drill-down state, fires TanStack
 *   Query for the active level's data, and provides a refresh
 *   callback for task mutations.
 * Returns: { level, breadcrumbs, pillars, goals, tasks, error,
 *   isLoading, drillIntoPillar, drillIntoGoal, navigateTo, refresh }
 */
export function useGoalsDrilldown() {
  const nav = useGoalsNav();
  const refresh = useGoalsRefresh();
  // CAUTION: Arrow wrapper required on ALL server action queryFn calls
  const pillarsQ = useQuery({
    queryKey: ['pillars'],
    queryFn: () => unwrap(() => fetchPillars()),
    enabled: nav.level === 'pillars',
  });
  const goalsQ = useQuery({
    queryKey: ['goals', nav.pillarId],
    queryFn: () => unwrap(() => fetchGoalsForPillar(nav.pillarId!)),
    enabled: nav.level === 'pillar' && !!nav.pillarId,
  });
  const tasksQ = useQuery({
    queryKey: ['goal-tasks', nav.goalId],
    queryFn: () => unwrap(() => fetchTasksForGoal(nav.goalId!)),
    enabled: nav.level === 'goal' && !!nav.goalId,
  });
  return {
    ...nav, refresh,
    pillars: pillarsQ.data ?? [], goals: goalsQ.data ?? [], tasks: tasksQ.data ?? [],
    isLoading: pillarsQ.isLoading || goalsQ.isLoading || tasksQ.isLoading,
    error: pillarsQ.error ?? goalsQ.error ?? tasksQ.error,
  };
}
