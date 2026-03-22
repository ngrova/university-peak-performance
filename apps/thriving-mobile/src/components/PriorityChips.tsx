// ═══════════════════════════════════════════════════════════
// FILE: PriorityChips.tsx
// PURPOSE: A horizontal row of P1–P4 color-coded pill buttons
//   for selecting task priority. Single-select — tapping one
//   deselects the others. Tapping the active one deselects it.
// CALLED BY: components/CaptureSheet.tsx, components/TaskDetailSheet.tsx
// DATA FLOW: CaptureSheet passes value + onChange → user taps
//   a pill → onChange fires with the priority number (or null)
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';

const PRIORITIES: { value: 1 | 2 | 3 | 4; label: string; color: string }[] = [
  { value: 1, label: 'P1', color: '#E24B4A' },
  { value: 2, label: 'P2', color: '#EF9F27' },
  { value: 3, label: 'P3', color: '#5DCAA5' },
  { value: 4, label: 'P4', color: '#888780' },
];

interface PriorityChipsProps {
  value: 1 | 2 | 3 | 4 | null;
  onChange: (priority: 1 | 2 | 3 | 4 | null) => void;
}

/**
 * Triggered by: CaptureSheet renders this in the capture form.
 * Steps: renders four pill buttons in a horizontal row. The active
 *   priority shows with a highlighted border and background. Tapping
 *   a pill selects it; tapping the active one clears the selection.
 * Returns: a row of priority pill buttons.
 */
export default function PriorityChips({ value, onChange }: PriorityChipsProps): React.JSX.Element {
  return (
    <div className="flex gap-2 mb-3">
      {PRIORITIES.map((p) => {
        const active = value === p.value;
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(active ? null : p.value)}
            aria-label={`Priority ${p.label}`}
            aria-pressed={active}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: active ? `${p.color}22` : 'var(--bg-input)',
              border: `1px solid ${active ? `${p.color}66` : 'var(--border)'}`,
              color: active ? p.color : 'var(--text-secondary)',
              minHeight: '36px',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
