'use client';

import React, { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchOneThing, fetchQueue, fetchDeadlineTasks } from '@/actions/today-actions';
import GreetingBar from './GreetingBar';
import OneThingCard from './OneThingCard';
import QueueList from './QueueList';
import OverdueList from './OverdueList';

/** Client wrapper that fetches and renders all Today screen sections */
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

  /** Invalidates all Today queries after a task is completed */
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
