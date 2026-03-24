'use client'
import React, { useState } from 'react'
import type { LifePillar } from '@upp/db'
import { createPillarAction, updatePillarAction } from '@/actions/pillar-actions'

interface PillarFormProps {
  pillar?: LifePillar
  onCancel: () => void
}

export default function PillarForm({ pillar, onCancel }: PillarFormProps): React.JSX.Element {
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    if (pillar) {
      await updatePillarAction(pillar.id, formData)
    } else {
      await createPillarAction(formData)
    }
    setPending(false)
    onCancel()
  }

  return (
    <form action={handleSubmit} className="space-y-3 p-4 bg-slate-50 rounded-lg border">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={pillar?.name}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
          placeholder="Health & Fitness"
        />
      </div>
      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700">Icon</label>
        <input
          id="icon"
          name="icon"
          type="text"
          defaultValue={pillar?.icon}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
          placeholder="🎯"
        />
      </div>
      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
        <input
          id="color"
          name="color"
          type="text"
          defaultValue={pillar?.color}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
          placeholder="#6366f1"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {pillar ? 'Save' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </form>
  )
}
