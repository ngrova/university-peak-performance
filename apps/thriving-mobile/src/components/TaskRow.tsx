// ═══════════════════════════════════════════════════════════
// FILE: TaskRow.tsx
// PURPOSE: A single task row used on the Today screen. Shows the
//   task title, goal name, and due date. Tapping opens the detail
//   sheet; swiping right marks it complete.
// CALLED BY: components/QueueList.tsx, components/OverdueList.tsx
// DATA FLOW: Parent passes a task as prop → tap opens detail sheet
//   via store → swipe calls completeTask server action → parent's
//   onCompleted callback refreshes the list
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { TaskWithContext } from '@upp/db';
import { useTaskDetail } from '@/hooks/use-task-detail';
import { completeTask } from '@/actions/task-actions';

interface TaskRowProps {
  task: TaskWithContext;
  onCompleted?: () => void;
}

/**
 * Triggered by: QueueList or OverdueList renders one of these per task.
 * Steps: shows the task's title, goal, and due date. Tracks touch
 *   start/end positions — a rightward swipe > 80px triggers the
 *   completeTask server action. A tap opens the task detail sheet.
 * Returns: a single interactive task row element.
 */
export default function TaskRow({ task, onCompleted }: TaskRowProps): React.JSX.Element {
  const openDetail = useTaskDetail((s) => s.open);
  const startX = useRef(0);
  const [swiped, setSwiped] = useState(false);
  const [completing, setCompleting] = useState(false);

  /** Tracks swipe start position */
  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0]?.clientX ?? 0;
  }

  /** Detects rightward swipe > 80px to trigger completion */
  async function onTouchEnd(e: React.TouchEvent) {
    const endX = e.changedTouches[0]?.clientX ?? 0;
    if (endX - startX.current > 80 && !completing) {
      setSwiped(true);
      setCompleting(true);
      const result = await completeTask(task.id);
      if (result.error) {
        setSwiped(false);
        setCompleting(false);
      } else {
        onCompleted?.();
      }
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div
      role="button"
      tabIndex={0}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={() => openDetail(task)}
      className="flex items-center gap-3 py-3 px-1 transition-all"
      style={{
        opacity: swiped ? 0.3 : 1,
        transform: swiped ? 'translateX(60px)' : 'translateX(0)',
        minHeight: '44px',
      }}
    >
      <div
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
        style={{ border: '2px solid var(--text-muted)' }}
      >
        {swiped && <Check size={14} style={{ color: 'var(--success)' }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.goals && (
            <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {task.goals.title}
            </span>
          )}
          {task.due_date && (
            <span className="text-xs" style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
