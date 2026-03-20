// ═══════════════════════════════════════════════════════════
// FILE: OverdueList.tsx
// PURPOSE: Shows overdue and due-today tasks with a red warning
//   icon on the Today screen. Hides itself entirely if nothing
//   is urgent — so users only see it when action is needed.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: TodayContent passes deadline tasks as prop → this
//   filters for overdue/today → renders TaskRows for urgent ones
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { TaskWithContext } from '@upp/db';
import TaskRow from './TaskRow';

interface OverdueListProps {
  tasks: TaskWithContext[];
  onTaskCompleted: () => void;
}

/**
 * Triggered by: TodayContent renders this at the bottom of the screen.
 * Steps: filters the task list down to tasks due today or earlier,
 *   returns null (renders nothing) if none are urgent, otherwise
 *   shows a red "Overdue & Due Today" header with TaskRows.
 * Returns: the urgent tasks section, or null if nothing is overdue.
 */
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
