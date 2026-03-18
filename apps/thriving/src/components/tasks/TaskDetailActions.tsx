'use client'
import React, { useState } from 'react'
import type { Task } from '@upp/db'
import { updateTaskStatusAction, deleteTaskAction } from '@/actions/task-actions'
import { pinOneThingAction } from '@/actions/one-thing-actions'

interface TaskDetailActionsProps {
  task: Task
  goalId: string
  pillarId: string
  onClose: () => void
  onEdit: () => void
}

// Renders action buttons for the task detail sheet
export default function TaskDetailActions({ task, goalId, pillarId, onClose, onEdit }: TaskDetailActionsProps): React.JSX.Element {
  const [completing, setCompleting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pinning, setPinning] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  const isDone = task.status === 'done'

  // Toggle task to next status and close sheet
  async function handleComplete() {
    setCompleting(true)
    await updateTaskStatusAction({ id: task.id, status: task.status }, goalId, pillarId)
    setCompleting(false)
    onClose()
  }

  // Confirm and delete the task
  async function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return
    setDeleting(true)
    await deleteTaskAction(task.id, goalId, pillarId)
    setDeleting(false)
    onClose()
  }

  // Pin this task as the user's One Thing
  async function handlePin() {
    setPinning(true)
    setPinError(null)
    const result = await pinOneThingAction(task.id, goalId, pillarId)
    setPinning(false)
    if (result.error) {
      setPinError(result.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="space-y-3">
      {!isDone && !task.is_one_thing && (
        <button
          onClick={handlePin}
          disabled={pinning}
          className="w-full font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)', height: '48px', fontSize: '15px' }}
        >
          {pinning ? 'Setting…' : '⭐ Make My One Thing'}
        </button>
      )}
      {pinError && <p className="text-sm text-center" style={{ color: 'var(--danger)' }}>{pinError}</p>}
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
        onClick={onEdit}
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
  )
}
