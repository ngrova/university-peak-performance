'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import type { Goal } from '@upp/db'
import { deleteGoalAction } from '@/actions/goal-actions'
import GoalForm from './GoalForm'

interface GoalCardProps {
  goal: Goal
  pillarId: string
}

const STATUS_BADGE: Record<Goal['status'], { bg: string; text: string }> = {
  active: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
  completed: { bg: 'rgba(100,116,139,0.12)', text: '#64748B' },
  archived: { bg: 'rgba(155,142,128,0.12)', text: '#9B8E80' },
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

  const badge = STATUS_BADGE[goal.status]

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{goal.title}</h4>
          {goal.description && (
            <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {goal.description}
            </p>
          )}
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
          style={{ backgroundColor: badge.bg, color: badge.text }}
        >
          {goal.status}
        </span>
      </div>
      {goal.target_date && (
        <p className="text-xs" style={{ color: 'var(--text-light)' }}>
          🗓 {new Date(goal.target_date).toLocaleDateString()}
        </p>
      )}
      <div className="flex gap-2 mt-1">
        <Link
          href={`/pillars/${pillarId}/goals/${goal.id}`}
          className="text-xs px-2 py-1 rounded-lg transition-colors hover:opacity-80"
          style={{ color: 'var(--accent)' }}
        >
          View Tasks
        </Link>
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
