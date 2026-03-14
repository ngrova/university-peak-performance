'use client'
import React, { useTransition } from 'react'
import { markOneThingDoneAction, skipOneThingAction } from '@/actions/one-thing-actions'

interface OneThingActionsProps {
  taskId: string
  wasPinned: boolean
}

export default function OneThingActions({ taskId, wasPinned }: OneThingActionsProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()

  function handleDone() {
    startTransition(async () => {
      await markOneThingDoneAction(taskId)
    })
  }

  function handleSkip() {
    startTransition(async () => {
      await skipOneThingAction(taskId, wasPinned)
    })
  }

  return (
    <div className="flex gap-4 mt-8">
      <button
        onClick={handleDone}
        disabled={isPending}
        className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Saving…' : '✅ Mark Done'}
      </button>
      <button
        onClick={handleSkip}
        disabled={isPending}
        className="py-3 px-6 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        Not now
      </button>
    </div>
  )
}
