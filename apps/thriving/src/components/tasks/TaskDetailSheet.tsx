'use client'
import React, { useState, useEffect } from 'react'
import type { Task } from '@upp/db'
import TaskForm from './TaskForm'
import TaskDetailActions from './TaskDetailActions'

interface TaskDetailSheetProps {
  task: Task
  goalId: string
  pillarId: string
  open: boolean
  onClose: () => void
}

const PRIORITY: Record<number, { label: string; color: string }> = {
  1: { label: 'Critical', color: 'var(--danger)' }, 2: { label: 'High', color: 'var(--warning)' },
  3: { label: 'Medium', color: 'var(--accent)' }, 4: { label: 'Low', color: 'var(--text-muted)' },
}
const COST_LABEL: Record<string, string> = { critical: '🔴 Critical', high: '🟠 High', medium: '🟡 Medium', low: '⚪ Low' }
const STATUS_LABEL: Record<string, string> = { todo: 'Not started', in_progress: 'In progress', done: 'Done', blocked: 'Blocked' }

// Bottom sheet showing task details, metadata, and action buttons
export default function TaskDetailSheet({ task, goalId, pillarId, open, onClose }: TaskDetailSheetProps): React.JSX.Element | null {
  const [editing, setEditing] = useState(false)

  useEffect(() => { if (!open) setEditing(false) }, [open])
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl sheet-enter"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', maxHeight: '80vh', overflowY: 'auto' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="rounded-full" style={{ width: 40, height: 4, backgroundColor: 'var(--border-hover)' }} />
        </div>

        {editing ? (
          <div className="px-4 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Edit Task</h2>
              <button onClick={() => setEditing(false)} style={{ color: 'var(--text-muted)', fontSize: 22 }}>×</button>
            </div>
            <TaskForm goalId={goalId} pillarId={pillarId} task={task} onCancel={() => setEditing(false)} />
          </div>
        ) : (
          <div className="px-4 pb-8 pt-2">
            <div className="mb-4">
              <h2 className="text-xl font-bold leading-snug mb-1" style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text-primary)' }}>
                {task.title}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{STATUS_LABEL[task.status]}</p>
            </div>
            <div className="rounded-xl p-4 mb-5 grid grid-cols-2 gap-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              {task.assignee && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Assigned to</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{task.assignee}</p>
                </div>
              )}
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Priority</p>
                <p className="text-sm font-medium" style={{ color: PRIORITY[task.priority]?.color ?? 'var(--text-secondary)' }}>
                  {PRIORITY[task.priority]?.label ?? '—'}
                </p>
              </div>
              {task.due_date && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Due date</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(`${task.due_date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
              {task.failure_cost && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Failure cost</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{COST_LABEL[task.failure_cost] ?? task.failure_cost}</p>
                </div>
              )}
            </div>
            {task.notes && (
              <div className="mb-5">
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Notes</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{task.notes}</p>
              </div>
            )}
            <TaskDetailActions task={task} goalId={goalId} pillarId={pillarId} onClose={onClose} onEdit={() => setEditing(true)} />
          </div>
        )}
      </div>
    </>
  )
}
