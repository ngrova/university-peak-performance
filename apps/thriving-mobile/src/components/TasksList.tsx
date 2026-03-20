'use client';

import React, { useMemo } from 'react';
import type { TaskWithContext } from '@upp/db';
import TaskGoalGroup from './TaskGoalGroup';

interface TasksListProps {
  tasks: TaskWithContext[];
  search: string;
  filter: string;
  onTaskChanged: () => void;
}

/** Filters, groups by goal, and renders task list */
export default function TasksList({ tasks, search, filter, onTaskChanged }: TasksListProps): React.JSX.Element {
  const filtered = useMemo(() => {
    let result = tasks;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (filter === 'active') result = result.filter((t) => t.status === 'todo' || t.status === 'in_progress');
    if (filter === 'blocked') result = result.filter((t) => t.status === 'blocked');
    if (filter === 'completed') result = result.filter((t) => t.status === 'done');
    return result;
  }, [tasks, search, filter]);

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
