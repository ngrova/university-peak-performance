'use client'
import React from 'react'
import type { SliderQuestion } from '@/lib/scorecard-constants'
import { computeQ2Score } from '@/lib/scorecard-scoring'

interface Props {
  question: SliderQuestion
  value: number
  onChange: (v: number) => void
}

export default function SliderStep({ question, value, onChange }: Props): React.JSX.Element {
  const score = computeQ2Score(value, question.multiplier)

  return (
    <div className="space-y-6">
      <p
        className="font-bold italic"
        style={{ fontFamily: 'var(--font-fraunces)', fontSize: '22px', color: 'var(--text-primary)' }}
      >
        {question.text}
      </p>
      <div className="px-1">
        <input
          type="range"
          min={question.min}
          max={question.max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-light)' }}>
          <span>{question.lowLabel}</span>
          <span>{question.highLabel}</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{value}</span>
        <span className="text-sm ml-1" style={{ color: 'var(--text-light)' }}>/ {question.max}</span>
        <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>Score: {score.toFixed(1)} / 10</p>
      </div>
    </div>
  )
}
