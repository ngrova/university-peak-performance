'use client';

import React, { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { TaskWithContext } from '@upp/db';
import { completeTask } from '@/actions/task-actions';
import { deleteTaskAction } from '@/actions/tasks-page-actions';
import { useTaskDetail } from '@/hooks/use-task-detail';
import DeleteConfirm from './DeleteConfirm';

interface TaskSwipeRowProps {
  task: TaskWithContext;
  onChanged: () => void;
}

/** Task row with swipe-right to complete and swipe-left to delete */
export default function TaskSwipeRow({ task, onChanged }: TaskSwipeRowProps): React.JSX.Element {
  const openDetail = useTaskDetail((s) => s.open);
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function onTouchStart(e: React.TouchEvent) { startX.current = e.touches[0]?.clientX ?? 0; }
  function onTouchMove(e: React.TouchEvent) { setOffset((e.touches[0]?.clientX ?? 0) - startX.current); }

  /** Handles swipe-right to complete or swipe-left to show delete confirm */
  async function onTouchEnd(e: React.TouchEvent) {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - startX.current;
    setOffset(0);
    if (busy) return;
    if (dx > 80) { setBusy(true); await completeTask(task.id); onChanged(); }
    else if (dx < -80) { setConfirmDelete(true); }
  }

  /** Executes delete after confirmation */
  async function handleDelete() {
    setBusy(true); setConfirmDelete(false); await deleteTaskAction(task.id); onChanged();
  }

  if (confirmDelete) {
    return <DeleteConfirm title={task.title} onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />;
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  const isDone = task.status === 'done';
  const isBlocked = task.status === 'blocked';

  return (
    <div className="relative overflow-hidden">
      {offset < -20 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center px-4" style={{ color: 'var(--danger)' }}>
          <Trash2 size={18} />
        </div>
      )}
      <div
        role="button"
        tabIndex={0}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => openDetail(task)}
        className="flex items-center gap-3 py-3 px-1 transition-transform"
        style={{
          transform: `translateX(${Math.max(-60, Math.min(60, offset))}px)`,
          opacity: busy ? 0.3 : isDone ? 0.5 : 1,
          minHeight: '44px',
        }}
      >
        <div
          className="flex-shrink-0 w-5 h-5 rounded-full"
          style={{
            border: isDone ? 'none' : `2px solid ${isBlocked ? 'var(--blocked)' : 'var(--text-muted)'}`,
            backgroundColor: isDone ? 'var(--success)' : 'transparent',
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate" style={{ color: 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {task.due_date && (
              <span className="text-xs" style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {isBlocked && <span className="text-xs" style={{ color: 'var(--blocked)' }}>Blocked</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
