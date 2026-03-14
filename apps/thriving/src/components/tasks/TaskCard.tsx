'use client'
import React, { useState } from 'react'
import type { Task } from '@upp/db'
import { deleteTaskAction, updateTaskStatusAction } from '@/actions/task-actions'
import TaskForm from './TaskForm'

interface TaskCardProps {
  task: Task
  goalId: string
  pillarId: string
}

const PRIORITY_BADGE: Record<number, { bg: string; text: string }> = {
  1: { bg: 'rgba(220,38,38,0.12)', text: '#DC2626' },
  2: { bg: 'rgba(234,88,12,0.12)', text: '#EA580C' },
  3: { bg: 'rgba(217,119,6,0.12)', text: '#D97706' },
  4: { bg: 'rgba(155,142,128,0.12)', text: '#9B8E80' },
}

const PRIORITY_LABEL: Record<number, string> = {
  1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4',
}

const STATUS_ICON: Record<Task['status'], string> = {
  todo: '○',
  in_progress: '◑',
  done: '●',
  blocked: '⊘',
}

const STATUS_COLOR: Record<Task['status'], string> = {
  todo: '#64748B',
  in_progress: '#D97706',
  done: '#10B981',
  blocked: '#F59E0B',
}

export default function TaskCard({ task, goalId, pillarId }: TaskCardProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)

  async function handleDelete() {
    if (confirm(`Delete "${task.title}"?`)) {
      await deleteTaskAction(task.id, goalId, pillarId)
    }
  }

  async function handleStatusToggle() {
    await updateTaskStatusAction({ id: task.id, status: task.status }, goalId, pillarId)
  }

  if (editing) {
    return <TaskForm goalId={goalId} pillarId={pillarId} task={task} onCancel={() => setEditing(false)} />
  }

  const pb = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE[4]!
  const isBlocked = task.status === 'blocked'

  return (
    <div
      className={`rounded-xl p-3 flex items-start gap-3 ${isBlocked ? 'status-blocked' : ''}`}
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={handleStatusToggle}
        className="mt-0.5 text-xl flex-shrink-0 transition-colors hover:opacity-70"
        style={{ color: STATUS_COLOR[task.status] }}
        title={`Status: ${task.status}`}
      >
        {STATUS_ICON[task.status]}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: pb.bg, color: pb.text }}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
          <p
            className={`text-sm font-medium ${task.status === 'done' ? 'line-through' : ''}`}
            style={{ color: task.status === 'done' ? 'var(--text-light)' : 'var(--text-primary)' }}
          >
            {task.title}
          </p>
        </div>
        {task.due_date && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
            🗓 {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
        {task.notes && (
          <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-light)' }}>{task.notes}</p>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-black/5"
          style={{ color: 'var(--text-light)' }}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-red-50"
          style={{ color: '#DC2626' }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
