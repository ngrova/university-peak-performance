// ═══════════════════════════════════════════════════════════
// FILE: OneThingCard.tsx
// PURPOSE: The hero card at the top of the Today screen showing
//   the user's single most important task. If no task is pinned,
//   shows a prompt to pick one. Tapping it opens the detail sheet.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: TodayContent passes the One Thing task as a prop →
//   this renders it → tap opens TaskDetailSheet via the store
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { Star } from 'lucide-react';
import type { TaskWithContext } from '@upp/db';
import { useTaskDetail } from '@/hooks/use-task-detail';

interface OneThingCardProps {
  task: TaskWithContext | null;
}

/**
 * Triggered by: TodayContent renders this with the One Thing task prop.
 * Steps: if no task exists, shows a placeholder prompting the user to
 *   pin one. If a task exists, displays its title and goal badge in a
 *   highlighted card. Tapping the card opens the task detail sheet.
 * Returns: a styled card element (or empty-state placeholder).
 */
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
