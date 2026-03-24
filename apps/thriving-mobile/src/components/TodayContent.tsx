// ═══════════════════════════════════════════════════════════
// FILE: TodayContent.tsx
// PURPOSE: The redesigned Today screen — a coach-style focus view.
//   Shows one hero card (the One Thing) with a "Why this?" explanation
//   and Mark Complete button, plus a muted "Up Next" section with 2-3
//   upcoming tasks. Filters to the current user's assigned tasks only.
// CALLED BY: app/(app)/today/page.tsx
// DATA FLOW: Page renders this → TanStack Query fetches tasks +
//   assignee name → filters to current user → client-side scoring
//   picks the One Thing + Up Next → renders layout
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTodayTasks } from '@/actions/today-actions';
import { rankTasks } from '@/lib/one-thing-score';
import { buildWhyThis } from '@/lib/why-this';
import GreetingBar from './GreetingBar';
import TodayHero from './TodayHero';
import UpNextSection from './UpNextSection';

/**
 * Triggered by: navigating to the Today tab (page.tsx renders this).
 * Steps: fetches all tasks + current user's assignee name, filters to
 *   tasks assigned to the current user, scores them client-side,
 *   renders the top task as a hero card and the next 3 as Up Next.
 * Returns: the full Today screen UI.
 */
export default function TodayContent(): React.JSX.Element {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['today-tasks'], queryFn: () => fetchTodayTasks() });

  // Filter to current user's assigned tasks, then score and rank
  const ranked = useMemo(() => {
    const allTasks = data?.tasks ?? [];
    const name = data?.assigneeName ?? null;
    // If name resolved, filter to assigned tasks; otherwise show all (graceful degradation)
    const myTasks = name ? allTasks.filter((t) => t.assignee === name) : allTasks;
    return rankTasks(myTasks);
  }, [data]);

  const hero = ranked[0] ?? null;
  const upNext = ranked.slice(1, 4);

  // Count open tasks in the hero's pillar for "Why this?" context
  const pillarTaskCount = useMemo(() => {
    if (!hero) return 0;
    const pillarId = hero.task.goals?.life_pillars?.id;
    if (!pillarId) return 0;
    return ranked.filter((s) => s.task.goals?.life_pillars?.id === pillarId).length;
  }, [hero, ranked]);

  const whyText = hero ? buildWhyThis(hero, pillarTaskCount) : '';

  // Refresh everything when a task is completed
  const handleCompleted = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['today-tasks'] });
    qc.invalidateQueries({ queryKey: ['all-tasks'] });
    qc.invalidateQueries({ queryKey: ['pillars'] });
    qc.invalidateQueries({ queryKey: ['goals'] });
  }, [qc]);

  // Distinguish "no assigned tasks" from "no tasks at all"
  const hasAnyTasks = (data?.tasks?.length ?? 0) > 0;
  const isFiltered = data?.assigneeName !== null && data?.assigneeName !== undefined;

  return (
    <div className="pt-2 tab-enter">
      <GreetingBar />
      {hero ? (
        <TodayHero scored={hero} whyText={whyText} onCompleted={handleCompleted} />
      ) : (
        <EmptyState noAssignedTasks={isFiltered && hasAnyTasks} />
      )}
      <UpNextSection items={upNext} />
    </div>
  );
}

/** Shown when there are no tasks to display */
function EmptyState({ noAssignedTasks }: { noAssignedTasks: boolean }): React.JSX.Element {
  return (
    <div className="text-center py-12">
      <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {noAssignedTasks ? 'Nothing assigned to you' : 'All clear'}
      </p>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {noAssignedTasks
          ? 'Tasks exist but none are assigned to you yet.'
          : 'No active tasks. Capture something to get started.'}
      </p>
    </div>
  );
}
