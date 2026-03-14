'use client'
import React, { useState } from 'react'
import type { Goal } from '@upp/db'
import { createGoalAction, updateGoalAction } from '@/actions/goal-actions'

interface GoalFormProps {
  pillarId: string
  goal?: Goal
  onCancel: () => void
}

const PRESET_COLORS = [
  '#0891B2', '#06B6D4', '#A855F7', '#8B5CF6',
  '#DC2626', '#EF4444', '#D97706', '#059669',
  '#10B981', '#1E40AF', '#7C3AED', '#4F46E5',
]

export default function GoalForm({ pillarId, goal, onCancel }: GoalFormProps): React.JSX.Element {
  const [pending, setPending] = useState(false)
  const [color, setColor] = useState(goal?.color ?? '#4F46E5')
  const [priorityRank, setPriorityRank] = useState(goal?.priority_rank ?? 5)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    formData.set('color', color)
    formData.set('priority_rank', String(priorityRank))
    if (goal) {
      await updateGoalAction(goal.id, pillarId, formData)
    } else {
      await createGoalAction(pillarId, formData)
    }
    setPending(false)
    onCancel()
  }

  return (
    <form action={handleSubmit} className="space-y-3 p-4 bg-slate-50 rounded-lg border">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          id="title" name="title" type="text" required
          defaultValue={goal?.title}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
          placeholder="Run a 5K"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description" name="description"
          defaultValue={goal?.description ?? ''}
          rows={3}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
          placeholder="Optional details..."
        />
      </div>
      <div>
        <label htmlFor="target_date" className="block text-sm font-medium text-gray-700">Target Date</label>
        <input
          id="target_date" name="target_date" type="date"
          defaultValue={goal?.target_date ?? ''}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: color === c ? `3px solid ${c}` : 'none',
                outlineOffset: '2px',
              }}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="priority_rank" className="block text-sm font-medium text-gray-700">
          Priority: <span className="font-bold">{priorityRank}</span>/10
        </label>
        <input
          id="priority_rank" name="priority_rank" type="range"
          min={1} max={10} value={priorityRank}
          onChange={(e) => setPriorityRank(Number(e.target.value))}
          className="mt-1 w-full accent-indigo-600"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit" disabled={pending}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {goal ? 'Save' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </form>
  )
}
