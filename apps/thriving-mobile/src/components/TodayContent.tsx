// ═══════════════════════════════════════════════════════════
// FILE: TodayContent.tsx
// PURPOSE: The main Today screen — shows a greeting, the user's
//   #1 focus task ("One Thing"), a priority queue of what's next,
//   and any overdue or due-today tasks. This is the first thing
//   users see when they open the app.
// CALLED BY: app/(app)/today/page.tsx
// DATA FLOW: Page renders this → TanStack Query calls three server
//   actions (fetchOneThing, fetchQueue, fetchDeadlineTasks) → data
//   flows down to child components as props
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchOneThing, fetchQueue, fetchDeadlineTasks } from '@/actions/today-actions';
import GreetingBar from './GreetingBar';
import OneThingCard from './OneThingCard';
import QueueList from './QueueList';
import OverdueList from './OverdueList';

/**
 * Triggered by: navigating to the Today tab (page.tsx renders this).
 * Steps: fires three parallel data fetches (One Thing, queue, deadlines),
 *   renders GreetingBar, OneThingCard, QueueList, and OverdueList with
 *   the fetched data, and provides a callback to refresh everything
 *   when a task is completed.
 * Returns: the full Today screen UI as a React element.
 */
export default function TodayContent(): React.JSX.Element {
  const queryClient = useQueryClient();

  // CAUTION: Arrow wrapper required on ALL server action queryFn/mutationFn calls
  // Direct reference causes AbortSignal serialization failure (silent empty data)
  const { data: oneThing } = useQuery({
    queryKey: ['one-thing'],
    queryFn: () => fetchOneThing(),
  });

  const { data: queue } = useQuery({
    queryKey: ['queue'],
    queryFn: () => fetchQueue(),
  });

  const { data: deadlines } = useQuery({
    queryKey: ['deadlines'],
    queryFn: () => fetchDeadlineTasks(),
  });

  /** When a task is completed, tells TanStack Query to re-fetch all three sections */
  const handleCompleted = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['one-thing'] });
    queryClient.invalidateQueries({ queryKey: ['queue'] });
    queryClient.invalidateQueries({ queryKey: ['deadlines'] });
  }, [queryClient]);

  return (
    <div className="pt-2 tab-enter">
      <GreetingBar />
      <OneThingCard task={oneThing ?? null} />
      <section className="mt-2">
        <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
          Up Next
        </h2>
        <QueueList tasks={queue ?? []} onTaskCompleted={handleCompleted} />
      </section>
      <OverdueList tasks={deadlines ?? []} onTaskCompleted={handleCompleted} />
    </div>
  );
}
