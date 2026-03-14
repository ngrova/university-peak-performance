import React from 'react'
import type { FailureCost } from '@upp/db'

interface FailureCostBadgeProps {
  cost: FailureCost | null
}

const COST_STYLES: Record<FailureCost, string> = {
  critical: 'bg-red-100 text-red-800 border border-red-200',
  high: 'bg-orange-100 text-orange-800 border border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  low: 'bg-green-100 text-green-700 border border-green-200',
}

const COST_LABEL: Record<FailureCost, string> = {
  critical: '🔴 Critical',
  high: '🟠 High',
  medium: '🟡 Medium',
  low: '🟢 Low',
}

export default function FailureCostBadge({ cost }: FailureCostBadgeProps): React.JSX.Element | null {
  if (!cost) return null
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${COST_STYLES[cost]}`}>
      {COST_LABEL[cost]}
    </span>
  )
}
