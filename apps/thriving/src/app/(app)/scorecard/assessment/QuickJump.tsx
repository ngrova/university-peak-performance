'use client'
import React from 'react'
import { DOMAINS } from '@/lib/scorecard-constants'

interface Props {
  currentDomain: number
  completed: Set<string>
  onJump: (index: number) => void
}

export default function QuickJump({ currentDomain, completed, onJump }: Props): React.JSX.Element {
  return (
    <div className="flex gap-1 justify-center flex-wrap py-1">
      {DOMAINS.map((d, i) => {
        const isCurrent = i === currentDomain
        const isDone = completed.has(d.key)
        return (
          <button
            key={d.key}
            onClick={() => onJump(i)}
            title={d.name}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all"
            style={{
              backgroundColor: isCurrent ? d.color : isDone ? `${d.color}22` : 'var(--bg-secondary)',
              border: `1.5px solid ${isCurrent ? d.color : isDone ? d.color : 'var(--border)'}`,
              transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            {d.icon}
          </button>
        )
      })}
    </div>
  )
}
