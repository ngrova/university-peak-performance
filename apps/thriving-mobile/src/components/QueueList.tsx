// ═══════════════════════════════════════════════════════════
// FILE: QueueList.tsx
// PURPOSE: The "Up Next" section on the Today screen — shows
//   a list of queued tasks sorted by priority. If there are no
//   tasks, shows a message to capture something with the + button.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: TodayContent passes task array as prop → this maps
//   each task to a TaskRow component
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { TaskWithContext } from '@upp/db';
import TaskRow from './TaskRow';

interface QueueListProps {
  tasks: TaskWithContext[];
  onTaskCompleted: () => void;
}

/**
 * Triggered by: TodayContent renders this in the "Up Next" section.
 * Steps: if the task list is empty, shows a friendly empty-state
 *   message. Otherwise renders a TaskRow for each task in a
 *   vertically divided list.
 * Returns: the queue section UI, or an empty-state message.
 */
export default function QueueList({ tasks, onTaskCompleted }: QueueListProps): React.JSX.Element {
  if (tasks.length === 0) {
    return (
      <p className="text-sm py-4" style={{ color: 'var(--text-muted)' }}>
        No tasks queued — capture something with the + button
      </p>
    );
  }

  return (
    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} onCompleted={onTaskCompleted} />
      ))}
    </div>
  );
}
