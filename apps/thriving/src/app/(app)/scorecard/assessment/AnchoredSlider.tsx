'use client'
import React from 'react'
import type { Domain, Anchor } from '@/lib/scorecard-constants'

interface Props {
  domain: Domain
  value: number
  onChange: (v: number) => void
}

function nearestAnchor(anchors: Anchor[], value: number): Anchor {
  return anchors.reduce((best, a) =>
    Math.abs(a.score - value) < Math.abs(best.score - value) ? a : best
  )
}

function toPercent(score: number): number {
  return ((score - 1) / 9) * 100
}

export default function AnchoredSlider({ domain, value, onChange }: Props): React.JSX.Element {
  const nearest = nearestAnchor(domain.anchors, value)
  const isNearAnchor = Math.abs(nearest.score - value) <= 0.5
  const filled = toPercent(value)

  return (
    <div className="space-y-4">
      {/* Score display */}
      <div className="text-center">
        <div
          className="font-bold leading-none"
          style={{ fontFamily: 'var(--font-fraunces)', fontSize: '64px', color: domain.color }}
        >
          {value.toFixed(1)}
        </div>
        {isNearAnchor && (
          <div className="text-sm font-semibold mt-1" style={{ color: domain.color }}>
            {nearest.label}
          </div>
        )}
      </div>

      {/* Slider */}
      <div className="relative px-1">
        <div className="relative h-8 flex items-center">
          {/* Track background */}
          <div className="absolute inset-x-0 h-2 rounded-full" style={{ backgroundColor: '#E5DFD6' }} />
          {/* Filled portion */}
          <div
            className="absolute left-0 h-2 rounded-full"
            style={{ width: `${filled}%`, background: `linear-gradient(to right, ${domain.color}88, ${domain.color})` }}
          />
          {/* Tick marks */}
          {domain.anchors.map((anchor) => (
            <div
              key={anchor.score}
              className="absolute w-0.5 h-3 rounded-full"
              style={{ left: `${toPercent(anchor.score)}%`, backgroundColor: domain.color, opacity: 0.5, transform: 'translateX(-50%)' }}
            />
          ))}
          {/* Range input */}
          <input
            type="range" min="1" max="10" step="0.1"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-x-0 w-full opacity-0 h-8 cursor-pointer"
            style={{ zIndex: 10 }}
          />
          {/* Custom thumb */}
          <div
            className="absolute w-8 h-8 rounded-full border-2 border-white shadow-md pointer-events-none flex items-center justify-center"
            style={{ left: `calc(${filled}% - 16px)`, backgroundColor: domain.color, zIndex: 5 }}
          >
            <span className="text-white text-xs font-bold leading-none" style={{ fontSize: '9px' }}>
              {value.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Anchor labels */}
      <div className="relative h-12 px-1">
        {domain.anchors.map((anchor) => {
          const isNearest = anchor.score === nearest.score
          return (
            <button
              key={anchor.score}
              onClick={() => onChange(anchor.score)}
              className="absolute text-center -translate-x-1/2 transition-all"
              style={{ left: `${toPercent(anchor.score)}%` }}
            >
              <span
                className="block text-xs font-semibold leading-tight"
                style={{ color: isNearest ? domain.color : 'var(--text-light)', fontSize: isNearest ? '12px' : '11px' }}
              >
                {anchor.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Anchor description */}
      <p className="text-center text-sm italic" style={{ color: 'var(--text-secondary)' }}>
        {nearest.description}
      </p>
    </div>
  )
}
