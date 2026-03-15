'use client'
import React, { useState, useEffect } from 'react'
import type { Task } from '@upp/db'
import { deleteTaskAction, updateTaskStatusAction } from '@/actions/task-actions'
import TaskForm from './TaskForm'

interface TaskDetailSheetProps {
  task: Task
  goalId: string
  pillarId: string
  open: boolean
  onClose: () => void
}

const PRIORITY_LABEL: Record<number, string> = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low' }
const PRIORITY_COLOR: Record<number, string> = {
  1: 'var(--danger)', 2: 'var(--warning)', 3: 'var(--accent)', 4: 'var(--text-muted)',
}
const COST_LABEL: Record<string, string> = {
  critical: '🔴 Critical', high: '🟠 High', medium: '🟡 Medium', low: '⚪ Low',
}
const STATUS_LABEL: Record<string, string> = {
  todo: 'Not started', in_progress: 'In progress', done: 'Done', blocked: 'Blocked',
}

export default function TaskDetailSheet({ task, goalId, pillarId, open, onClose }: TaskDetailSheetProps): React.JSX.Element | null {
  const [editing, setEditing] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open) setEditing(false)
  }, [open])

  if (!open) return null

  async function handleComplete() {
    setCompleting(true)
    await updateTaskStatusAction({ id: task.id, status: task.status }, goalId, pillarId)
    setCompleting(false)
    onClose()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return
    setDeleting(true)
    await deleteTaskAction(task.id, goalId, pillarId)
    setDeleting(false)
    onClose()
  }

  const isDone = task.status === 'done'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl sheet-enter"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', maxHeight: '80vh', overflowY: 'auto' }}
        role="dialog"
        aria-modal="true"
      >
        {/* Drag handle */}
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
            {/* Title + status */}
            <div className="mb-4">
              <h2
                className="text-xl font-bold leading-snug mb-1"
                style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text-primary)' }}
              >
                {task.title}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{STATUS_LABEL[task.status]}</p>
            </div>

            {/* Meta grid */}
            <div
              className="rounded-xl p-4 mb-5 grid grid-cols-2 gap-3"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              {task.assignee && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Assigned to</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{task.assignee}</p>
                </div>
              )}
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Priority</p>
                <p className="text-sm font-medium" style={{ color: PRIORITY_COLOR[task.priority] ?? 'var(--text-secondary)' }}>
                  {PRIORITY_LABEL[task.priority] ?? '—'}
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

            {/* Actions */}
            <div className="space-y-3">
              {!isDone && (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: 'var(--accent)', color: '#1A1410', height: '48px', fontSize: '15px' }}
                >
                  {completing ? 'Marking done…' : '✓ Mark Complete'}
                </button>
              )}
              <button
                onClick={() => setEditing(true)}
                className="w-full font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: 'transparent', border: '1px solid var(--border-hover)', color: 'var(--text-secondary)', height: '44px' }}
              >
                ✏️ Edit Task
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                style={{ backgroundColor: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--danger)', height: '44px' }}
              >
                {deleting ? 'Deleting…' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
