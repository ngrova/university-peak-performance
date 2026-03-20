'use client';

import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { fetchAllTasks } from '@/actions/tasks-page-actions';
import { useCaptureSheet } from '@/hooks/use-capture-sheet';
import TaskSearchBar from './TaskSearchBar';
import TaskFilterChips from './TaskFilterChips';
import TasksList from './TasksList';

/** Orchestrator: fetches tasks and manages search/filter state */
export default function TasksContent(): React.JSX.Element {
  const queryClient = useQueryClient();
  const openCapture = useCaptureSheet((s) => s.open);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked' | 'completed'>('all');

  const { data: tasks } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => fetchAllTasks(),
  });

  /** Refetches after any task mutation */
  const handleChanged = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['queue'] });
    queryClient.invalidateQueries({ queryKey: ['one-thing'] });
  }, [queryClient]);

  return (
    <div className="pt-2 tab-enter">
      <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        Tasks
      </h1>
      <TaskSearchBar value={search} onChange={setSearch} />
      <TaskFilterChips value={filter} onChange={setFilter} />
      <TasksList tasks={tasks ?? []} search={search} filter={filter} onTaskChanged={handleChanged} />
      <button
        type="button"
        onClick={openCapture}
        aria-label="Add task"
        className="fixed right-5 flex items-center justify-center rounded-full"
        style={{
          bottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom) + 16px)',
          width: '52px', height: '52px',
          backgroundColor: 'var(--accent)', color: '#0A0A0F',
        }}
      >
        <PlusCircle size={24} />
      </button>
    </div>
  );
}
