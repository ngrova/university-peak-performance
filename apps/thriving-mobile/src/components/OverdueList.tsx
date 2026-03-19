'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { TaskWithContext } from '@upp/db';
import TaskRow from './TaskRow';

interface OverdueListProps {
  tasks: TaskWithContext[];
  onTaskCompleted: () => void;
}

/** Shows overdue and due-today tasks with red accent — hidden if empty */
export default function OverdueList({ tasks, onTaskCompleted }: OverdueListProps): React.JSX.Element | null {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const urgent = tasks.filter((t) => t.due_date && t.due_date <= todayStr);

  if (urgent.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
        <h2 className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
          Overdue & Due Today
        </h2>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {urgent.map((task) => (
          <TaskRow key={task.id} task={task} onCompleted={onTaskCompleted} />
        ))}
      </div>
    </section>
  );
}
