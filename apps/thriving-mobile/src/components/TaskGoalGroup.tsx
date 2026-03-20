'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { TaskWithContext } from '@upp/db';
import TaskSwipeRow from './TaskSwipeRow';

interface TaskGoalGroupProps {
  goalTitle: string;
  tasks: TaskWithContext[];
  onTaskChanged: () => void;
}

/** Collapsible section grouping tasks under a goal */
export default function TaskGoalGroup({ goalTitle, tasks, onTaskChanged }: TaskGoalGroupProps): React.JSX.Element {
  const [open, setOpen] = useState(true);
  const Icon = open ? ChevronDown : ChevronRight;

  return (
    <section className="mb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full py-2"
        style={{ minHeight: '44px' }}
      >
        <Icon size={16} style={{ color: 'var(--text-muted)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {goalTitle}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          ({tasks.length})
        </span>
      </button>
      {open && (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {tasks.map((task) => (
            <TaskSwipeRow key={task.id} task={task} onChanged={onTaskChanged} />
          ))}
        </div>
      )}
    </section>
  );
}
