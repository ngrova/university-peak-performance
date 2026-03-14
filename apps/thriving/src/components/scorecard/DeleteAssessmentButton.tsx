'use client'
import React, { useTransition } from 'react'
import { deleteAssessmentAction } from '@/actions/scorecard-actions'

interface Props {
  id: string
}

export default function DeleteAssessmentButton({ id }: Props): React.JSX.Element {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Delete this assessment?')) return
    startTransition(async () => {
      await deleteAssessmentAction(id)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label="Delete assessment"
      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
      </svg>
    </button>
  )
}
