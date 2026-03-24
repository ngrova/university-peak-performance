'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import type { PillarWithProgress } from '@upp/db'
import { deletePillarAction } from '@/actions/pillar-actions'
import PillarForm from './PillarForm'
import PillarProgress from './PillarProgress'

interface PillarCardProps {
  pillar: PillarWithProgress
}

export default function PillarCard({ pillar }: PillarCardProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)

  async function handleDelete() {
    if (confirm(`Delete "${pillar.name}"?`)) {
      await deletePillarAction(pillar.id)
    }
  }

  if (editing) {
    return <PillarForm pillar={pillar} onCancel={() => setEditing(false)} />
  }

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: `1px solid var(--border)`,
        borderLeft: `4px solid ${pillar.color}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{pillar.icon}</span>
        <h3 className="font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>{pillar.name}</h3>
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: pillar.color }}
          aria-label={`Color: ${pillar.color}`}
        />
      </div>
      <PillarProgress
        goalCount={pillar.goalCount}
        taskCount={pillar.taskCount}
        completedTaskCount={pillar.completedTaskCount}
      />
      <div className="flex items-center gap-2 mt-auto">
        <Link
          href={`/pillars/${pillar.id}`}
          className="text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--accent)' }}
        >
          View Goals →
        </Link>
        <div className="ml-auto flex gap-2">
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
    </div>
  )
}
