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

const PRIORITY_BADGE: Record<number, string> = {
  1: 'bg-red-100 text-red-800',
  2: 'bg-orange-100 text-orange-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-gray-100 text-gray-600',
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

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm flex items-start gap-3">
      <button
        onClick={handleStatusToggle}
        className="mt-0.5 text-xl text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0"
        title={`Status: ${task.status}`}
      >
        {STATUS_ICON[task.status]}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_BADGE[task.priority]}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </p>
        </div>
        {task.due_date && (
          <p className="text-xs text-gray-500 mt-1">🗓 {new Date(task.due_date).toLocaleDateString()}</p>
        )}
        {task.notes && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.notes}</p>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
