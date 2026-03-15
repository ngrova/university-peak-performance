'use client'
import React, { useState, useTransition } from 'react'
import { markOneThingDoneAction, skipOneThingAction } from '@/actions/one-thing-actions'
import CelebrationOverlay from '@/components/ui/CelebrationOverlay'

interface OneThingActionsProps {
  taskId: string
  taskTitle: string
  wasPinned: boolean
}

export default function OneThingActions({ taskId, taskTitle, wasPinned }: OneThingActionsProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [showCelebration, setShowCelebration] = useState(false)

  function handleDone() {
    setShowCelebration(true)
    startTransition(async () => { await markOneThingDoneAction(taskId) })
  }

  function handleSkip() {
    startTransition(async () => { await skipOneThingAction(taskId, wasPinned) })
  }

  return (
    <>
      {showCelebration && (
        <CelebrationOverlay taskTitle={taskTitle} onDismiss={() => setShowCelebration(false)} />
      )}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          onClick={handleDone}
          disabled={isPending}
          className="flex-1 py-4 sm:py-3 px-6 text-white font-semibold text-lg disabled:opacity-50 transition-all min-h-[48px]"
          style={{
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, #10B981, #059669)',
          }}
        >
          {isPending ? 'Saving…' : '✅ Mark Done'}
        </button>
        <button
          onClick={handleSkip}
          disabled={isPending}
          className="py-4 sm:py-3 px-6 font-medium disabled:opacity-50 transition-colors hover:bg-black/5 min-h-[48px]"
          style={{
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          Not now
        </button>
      </div>
    </>
  )
}
