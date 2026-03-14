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
      <p className="text-lg font-semibold text-gray-800">{question.text}</p>
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
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{question.lowLabel}</span>
          <span>{question.highLabel}</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-4xl font-bold text-amber-600">{value}</span>
        <span className="text-sm text-gray-400 ml-1">/ {question.max}</span>
        <p className="text-xs text-gray-400 mt-1">Score: {score.toFixed(1)} / 10</p>
      </div>
    </div>
  )
}
