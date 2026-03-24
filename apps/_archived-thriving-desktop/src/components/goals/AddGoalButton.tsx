'use client'
import React, { useState } from 'react'
import GoalForm from './GoalForm'

interface AddGoalButtonProps {
  pillarId: string
}

export default function AddGoalButton({ pillarId }: AddGoalButtonProps): React.JSX.Element {
  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">New Goal</h2>
          </div>
          <GoalForm pillarId={pillarId} onCancel={() => setOpen(false)} />
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
    >
      + Add Goal
    </button>
  )
}
