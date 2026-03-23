// ═══════════════════════════════════════════════════════════
// FILE: TasksContent.tsx
// PURPOSE: The main Tasks screen — fetches all tasks and manages
//   the search text, status filter, assignee filter, and priority
//   filter. Combines search bar, filter chips, task list, and
//   floating "+" button.
// CALLED BY: app/(app)/tasks/page.tsx
// DATA FLOW: Page renders this → TanStack Query calls fetchAllTasks
//   → user types/filters → state flows to TasksList for filtering
//   → task mutations trigger re-fetch via handleChanged
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { fetchAllTasks } from '@/actions/tasks-page-actions';
import TaskSearchBar from './TaskSearchBar';
import TaskFilterChips from './TaskFilterChips';
import AssigneeFilterChips from './AssigneeFilterChips';
import PriorityFilterChips from './PriorityFilterChips';
import TasksList from './TasksList';
import type { AssigneeFilter } from './AssigneeFilterChips';
import type { PriorityFilter } from './PriorityFilterChips';

/**
 * Triggered by: navigating to the Tasks tab (page.tsx renders this).
 * Steps: fetches all tasks via TanStack Query, holds the search text
 *   and filter selections (status, assignee, priority) in state,
 *   renders search bar + three filter rows + task list + add button.
 *   When any task is changed, invalidates all relevant query caches.
 * Returns: the full Tasks screen UI as a React element.
 */
export default function TasksContent(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked' | 'completed'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

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
      <AssigneeFilterChips value={assigneeFilter} onChange={setAssigneeFilter} />
      <PriorityFilterChips value={priorityFilter} onChange={setPriorityFilter} />
      <TasksList
        tasks={tasks ?? []}
        search={search}
        filter={filter}
        assigneeFilter={assigneeFilter}
        priorityFilter={priorityFilter}
        onTaskChanged={handleChanged}
      />
      <Link
        href="/capture"
        aria-label="Add task"
        className="fixed right-5 flex items-center justify-center rounded-full"
        style={{
          bottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom) + 16px)',
          width: '52px', height: '52px',
          backgroundColor: 'var(--accent)', color: '#0A0A0F',
        }}
      >
        <PlusCircle size={24} />
      </Link>
    </div>
  );
}
