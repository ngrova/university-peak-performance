'use client';

import React from 'react';
import type { TaskWithContext } from '@upp/db';
import TaskRow from './TaskRow';

interface QueueListProps {
  tasks: TaskWithContext[];
  onTaskCompleted: () => void;
}

/** "Up Next" section showing queued tasks sorted by priority */
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
