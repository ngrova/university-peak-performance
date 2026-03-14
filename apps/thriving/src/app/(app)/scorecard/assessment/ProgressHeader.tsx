'use client'
import React from 'react'
import { DOMAINS } from '@/lib/scorecard-constants'

interface Props {
  currentDomain: number
  completed: Set<string>
}

export default function ProgressHeader({ currentDomain, completed }: Props): React.JSX.Element {
  const minsLeft = Math.ceil((DOMAINS.length - currentDomain) * 0.5)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-light)' }}>
        <span>{currentDomain + 1} of {DOMAINS.length}</span>
        <span>about {minsLeft} min left</span>
      </div>
      <div className="flex gap-1.5 justify-center">
        {DOMAINS.map((d, i) => {
          const isDone = completed.has(d.key)
          const isCurrent = i === currentDomain
          if (isDone) {
            return (
              <div key={d.key} className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            )
          }
          if (isCurrent) {
            return (
              <div
                key={d.key} className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'transparent', border: `2px solid ${d.color}`, boxShadow: `0 0 0 2px ${d.color}44` }}
              />
            )
          }
          return <div key={d.key} className="w-3 h-3 rounded-full bg-gray-200" />
        })}
      </div>
    </div>
  )
}
