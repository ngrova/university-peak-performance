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
      <p
        className="font-bold italic mb-4"
        style={{ fontFamily: 'var(--font-fraunces)', fontSize: '22px', color: 'var(--text-primary)' }}
      >
        {question.text}
      </p>
      {question.options.map((opt, i) => {
        const isSelected = selected === opt.score
        return (
          <button
            key={i}
            onClick={() => onSelect(opt.score)}
            className="w-full text-left px-4 py-3 border-2 transition-all text-sm font-medium"
            style={{
              borderRadius: 'var(--radius-md)',
              borderColor: isSelected ? '#D97706' : 'var(--border)',
              backgroundColor: isSelected ? 'rgba(217,119,6,0.08)' : '#fff',
              color: isSelected ? '#92400e' : 'var(--text-primary)',
            }}
          >
            {opt.text}
          </button>
        )
      })}
    </div>
  )
}
