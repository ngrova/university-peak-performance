'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import type { LifePillar } from '@upp/db'
import { deletePillarAction } from '@/actions/pillar-actions'
import PillarForm from './PillarForm'

interface PillarCardProps {
  pillar: LifePillar
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
      className="rounded-lg border bg-white p-4 shadow-sm flex flex-col gap-3"
      style={{ borderLeftColor: pillar.color, borderLeftWidth: 4 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{pillar.icon}</span>
        <h3 className="font-semibold text-gray-900 flex-1">{pillar.name}</h3>
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: pillar.color }}
          aria-label={`Color: ${pillar.color}`}
        />
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <Link
          href={`/pillars/${pillar.id}`}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View Goals →
        </Link>
        <div className="ml-auto flex gap-2">
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
    </div>
  )
}
