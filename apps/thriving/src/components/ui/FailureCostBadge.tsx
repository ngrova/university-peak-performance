import React from 'react'
import type { FailureCost } from '@upp/db'

interface FailureCostBadgeProps {
  cost: FailureCost | null
}

const COST_STYLES: Record<FailureCost, { bg: string; text: string; border: string }> = {
  critical: { bg: 'rgba(220,38,38,0.1)', text: '#DC2626', border: 'rgba(220,38,38,0.3)' },
  high: { bg: 'rgba(234,88,12,0.1)', text: '#EA580C', border: 'rgba(234,88,12,0.3)' },
  medium: { bg: 'rgba(217,119,6,0.1)', text: '#D97706', border: 'rgba(217,119,6,0.3)' },
  low: { bg: 'rgba(155,142,128,0.1)', text: '#9B8E80', border: 'rgba(155,142,128,0.3)' },
}

const COST_LABEL: Record<FailureCost, string> = {
  critical: '🔴 Critical',
  high: '🟠 High',
  medium: '🟡 Medium',
  low: '⚪ Low',
}

export default function FailureCostBadge({ cost }: FailureCostBadgeProps): React.JSX.Element | null {
  if (!cost) return null
  const s = COST_STYLES[cost]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {COST_LABEL[cost]}
    </span>
  )
}
