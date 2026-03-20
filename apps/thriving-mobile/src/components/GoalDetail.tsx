// ═══════════════════════════════════════════════════════════
// FILE: GoalDetail.tsx
// PURPOSE: The third drill-down level — shows a goal's tasks
//   as swipeable rows. Users can complete tasks (swipe right)
//   or delete them (swipe left). Tapping opens the detail sheet.
// CALLED BY: components/GoalsContent.tsx
// DATA FLOW: GoalsContent passes tasks array + refresh callback →
//   this renders TaskSwipeRow per task → swipe/tap actions fire
//   server actions → refresh re-fetches data
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { TaskWithContext } from '@upp/db';
import TaskSwipeRow from './TaskSwipeRow';

interface GoalDetailProps {
  tasks: TaskWithContext[];
  onTaskChanged: () => void;
}

/**
 * Triggered by: GoalsContent renders this at drill-down level 3.
 * Steps: if no tasks exist, shows an empty-state message. Otherwise
 *   renders a TaskSwipeRow for each task (reused from Phase 2).
 * Returns: the task list section, or an empty-state message.
 */
export default function GoalDetail({ tasks, onTaskChanged }: GoalDetailProps): React.JSX.Element {
  if (tasks.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        No tasks for this goal yet — capture one with the + button
      </p>
    );
  }

  return (
    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
      {tasks.map((task) => (
        <TaskSwipeRow key={task.id} task={task} onChanged={onTaskChanged} />
      ))}
    </div>
  );
}
