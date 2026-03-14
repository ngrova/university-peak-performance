'use client'
import React, { useState } from 'react'
import type { Goal } from '@upp/db'
import { deleteGoalAction } from '@/actions/goal-actions'
import GoalForm from './GoalForm'

interface GoalCardProps {
  goal: Goal
  pillarId: string
}

const STATUS_BADGE: Record<Goal['status'], string> = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-600',
}

export default function GoalCard({ goal, pillarId }: GoalCardProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)

  async function handleDelete() {
    if (confirm(`Delete "${goal.title}"?`)) {
      await deleteGoalAction(goal.id, pillarId)
    }
  }

  if (editing) {
    return <GoalForm pillarId={pillarId} goal={goal} onCancel={() => setEditing(false)} />
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{goal.title}</h4>
          {goal.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{goal.description}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[goal.status]}`}>
          {goal.status}
        </span>
      </div>
      {goal.target_date && (
        <p className="text-xs text-gray-500">🗓 {new Date(goal.target_date).toLocaleDateString()}</p>
      )}
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
