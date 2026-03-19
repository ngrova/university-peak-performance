'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useTaskDetail } from '@/hooks/use-task-detail';
import { updateTaskField } from '@/actions/task-actions';
import TaskActions from './TaskActions';

/** Bottom sheet showing task details — auto-saves on change */
export default function TaskDetailSheet(): React.JSX.Element | null {
  const task = useTaskDetail((s) => s.task);
  const close = useTaskDetail((s) => s.close);

  if (!task) return null;

  /** Auto-saves a field on blur/change */
  async function saveField(field: string, value: string | null) {
    await updateTaskField(task!.id, field, value);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div
        className="relative rounded-t-2xl p-5 sheet-enter max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Task Detail
          </h2>
          <button type="button" onClick={close} aria-label="Close" style={{ minHeight: '44px', minWidth: '44px' }} className="flex items-center justify-center">
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <input
          defaultValue={task.title}
          onBlur={(e) => saveField('title', e.target.value)}
          className="w-full text-lg font-semibold bg-transparent border-none outline-none mb-4"
          style={{ color: 'var(--text-primary)' }}
        />

        <TaskActions taskId={task.id} status={task.status} onCompleted={close} />

        {task.goals && (
          <div className="mb-3">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Goal</span>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{task.goals.title}</p>
          </div>
        )}

        <div className="mb-3">
          <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Deadline</label>
          <input
            type="date"
            defaultValue={task.due_date ?? ''}
            onChange={(e) => saveField('due_date', e.target.value || null)}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="mb-3">
          <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Notes</label>
          <textarea
            defaultValue={task.notes ?? ''}
            onBlur={(e) => saveField('notes', e.target.value || null)}
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm resize-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>
    </div>
  );
}
