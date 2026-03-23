// ═══════════════════════════════════════════════════════════
// FILE: TasksList.tsx
// PURPOSE: Takes the full task array, applies search, status,
//   assignee, and priority filters, groups the results by goal,
//   and renders a TaskGoalGroup for each group. Shows empty-state
//   messages when no tasks match.
// CALLED BY: components/TasksContent.tsx
// DATA FLOW: TasksContent passes tasks + filters → this filters
//   and groups them → renders TaskGoalGroup per goal
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useMemo } from 'react';
import type { TaskWithContext } from '@upp/db';
import TaskGoalGroup from './TaskGoalGroup';
import type { AssigneeFilter } from './AssigneeFilterChips';
import type { PriorityFilter } from './PriorityFilterChips';

interface TasksListProps {
  tasks: TaskWithContext[];
  search: string;
  filter: string;
  assigneeFilter: AssigneeFilter;
  priorityFilter: PriorityFilter;
  onTaskChanged: () => void;
}

/**
 * Triggered by: TasksContent renders this with the full task array.
 * Steps: applies the text search filter, then status, assignee, and
 *   priority filters (AND logic). Groups surviving tasks by goal
 *   title and renders a TaskGoalGroup per group.
 * Returns: grouped task sections, or an empty-state message.
 */
export default function TasksList(props: TasksListProps): React.JSX.Element {
  const { tasks, search, filter, assigneeFilter, priorityFilter, onTaskChanged } = props;

  const filtered = useMemo(() => {
    let result = tasks;
    // Text search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    // Status filter
    if (filter === 'active') result = result.filter((t) => t.status === 'todo' || t.status === 'in_progress');
    if (filter === 'blocked') result = result.filter((t) => t.status === 'blocked');
    if (filter === 'completed') result = result.filter((t) => t.status === 'done');
    // Assignee filter
    if (assigneeFilter !== 'all') result = result.filter((t) => t.assignee === assigneeFilter);
    // Priority filter
    if (priorityFilter !== 'all') result = result.filter((t) => t.priority === priorityFilter);
    return result;
  }, [tasks, search, filter, assigneeFilter, priorityFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, { title: string; tasks: TaskWithContext[] }>();
    for (const task of filtered) {
      const goalTitle = task.goals?.title ?? 'Uncategorized';
      const group = map.get(goalTitle) ?? { title: goalTitle, tasks: [] };
      group.tasks.push(task);
      map.set(goalTitle, group);
    }
    return Array.from(map.values());
  }, [filtered]);

  if (filtered.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        {search ? 'No tasks match your search' : 'No tasks found'}
      </p>
    );
  }

  return (
    <div>
      {grouped.map((group) => (
        <TaskGoalGroup key={group.title} goalTitle={group.title} tasks={group.tasks} onTaskChanged={onTaskChanged} />
      ))}
    </div>
  );
}
