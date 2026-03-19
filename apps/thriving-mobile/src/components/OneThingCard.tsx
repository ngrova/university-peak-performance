'use client';

import React from 'react';
import { Star } from 'lucide-react';
import type { TaskWithContext } from '@upp/db';
import { useTaskDetail } from '@/hooks/use-task-detail';

interface OneThingCardProps {
  task: TaskWithContext | null;
}

/** Hero card showing the pinned One Thing or empty state prompt */
export default function OneThingCard({ task }: OneThingCardProps): React.JSX.Element {
  const openDetail = useTaskDetail((s) => s.open);

  if (!task) {
    return (
      <div
        className="rounded-xl p-5 mb-4 text-center"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <Star size={28} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-2" />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          No One Thing yet — pin a task to focus on today
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openDetail(task)}
      className="w-full rounded-xl p-5 mb-4 text-left"
      style={{
        backgroundColor: 'var(--bg-surface)',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(232,168,56,0.08) 100%)',
        minHeight: '44px',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Star size={16} fill="var(--accent)" style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
          One Thing
        </span>
      </div>
      <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        {task.title}
      </p>
      {task.goals && (
        <span
          className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs"
          style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
        >
          {task.goals.title}
        </span>
      )}
    </button>
  );
}
