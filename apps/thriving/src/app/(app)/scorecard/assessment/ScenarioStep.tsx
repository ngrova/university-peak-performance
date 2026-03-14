'use client'
import React from 'react'
import type { ScenarioQuestion } from '@/lib/scorecard-constants'

interface Props {
  question: ScenarioQuestion
  selected: number | null
  onSelect: (score: number) => void
}

export default function ScenarioStep({ question, selected, onSelect }: Props): React.JSX.Element {
  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold text-gray-800 mb-4">{question.text}</p>
      {question.options.map((opt, i) => {
        const isSelected = selected === opt.score
        return (
          <button
            key={i}
            onClick={() => onSelect(opt.score)}
            className={[
              'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium',
              isSelected
                ? 'border-amber-500 bg-amber-50 text-amber-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50/50',
            ].join(' ')}
          >
            {opt.text}
          </button>
        )
      })}
    </div>
  )
}
