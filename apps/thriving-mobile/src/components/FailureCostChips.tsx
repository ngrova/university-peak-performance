// ═══════════════════════════════════════════════════════════
// FILE: FailureCostChips.tsx
// PURPOSE: A horizontal row of tappable pills for selecting
//   task failure cost — low, medium, high, or critical.
//   Single-select. Tapping the active one clears the selection.
// CALLED BY: components/TaskDetailSheet.tsx
// DATA FLOW: TaskDetailSheet passes value + onChange → user taps
//   a pill → onChange fires with the cost level (or null)
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { FailureCost } from '@upp/db';

const COSTS: { value: FailureCost; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#5DCAA5' },
  { value: 'medium', label: 'Medium', color: '#EF9F27' },
  { value: 'high', label: 'High', color: '#E24B4A' },
  { value: 'critical', label: 'Critical', color: '#C026D3' },
];

interface FailureCostChipsProps {
  value: FailureCost | null;
  onChange: (cost: FailureCost | null) => void;
}

/**
 * Triggered by: TaskDetailSheet renders this in the edit form.
 * Steps: renders four pill buttons in a horizontal row. The active
 *   cost shows with a highlighted border and background. Tapping
 *   a pill selects it; tapping the active one clears the selection.
 * Returns: a row of failure cost pill buttons.
 */
export default function FailureCostChips({ value, onChange }: FailureCostChipsProps): React.JSX.Element {
  return (
    <div className="flex gap-2 mb-3">
      {COSTS.map((c) => {
        const active = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(active ? null : c.value)}
            aria-label={`Failure cost ${c.label}`}
            aria-pressed={active}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: active ? `${c.color}22` : 'var(--bg-input)',
              border: `1px solid ${active ? `${c.color}66` : 'var(--border)'}`,
              color: active ? c.color : 'var(--text-secondary)',
              minHeight: '36px',
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
