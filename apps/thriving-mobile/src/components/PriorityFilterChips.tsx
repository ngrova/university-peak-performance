// ═══════════════════════════════════════════════════════════
// FILE: PriorityFilterChips.tsx
// PURPOSE: Horizontally scrollable filter chips for filtering
//   tasks by priority — "All", "P1", "P2", "P3", "P4". Each
//   priority chip uses its canonical color from PriorityChips.
// CALLED BY: components/TasksContent.tsx
// DATA FLOW: User taps a chip → onChange sends the priority value
//   to TasksContent → TasksContent passes it to TasksList which
//   shows only matching tasks
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';

export type PriorityFilter = 'all' | 1 | 2 | 3 | 4;

interface PriorityFilterChipsProps {
  value: PriorityFilter;
  onChange: (value: PriorityFilter) => void;
}

/** Priority color map matching PriorityChips.tsx */
const PRIORITY_COLORS: Record<number, string> = {
  1: '#E24B4A',
  2: '#EF9F27',
  3: '#5DCAA5',
  4: '#888780',
};

const FILTERS: { label: string; value: PriorityFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'P1', value: 1 },
  { label: 'P2', value: 2 },
  { label: 'P3', value: 3 },
  { label: 'P4', value: 4 },
];

/**
 * Triggered by: TasksContent renders this below the assignee filter row.
 * Steps: renders a row of pill-shaped buttons, one per priority level.
 *   The active filter gets a colored highlight matching PriorityChips.
 *   The "All" chip uses the standard accent style. Tapping a chip
 *   calls onChange with that priority value.
 * Returns: a scrollable row of color-coded priority filter buttons.
 */
export default function PriorityFilterChips({ value, onChange }: PriorityFilterChipsProps): React.JSX.Element {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto" role="radiogroup" aria-label="Filter by priority">
      {FILTERS.map((f) => {
        const active = value === f.value;
        const color = typeof f.value === 'number' ? PRIORITY_COLORS[f.value] : undefined;
        return (
          <button
            key={String(f.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(f.value)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={color ? {
              backgroundColor: active ? `${color}22` : 'var(--bg-surface)',
              color: active ? color : 'var(--text-secondary)',
              minHeight: '32px',
            } : {
              backgroundColor: active ? 'var(--accent-muted)' : 'var(--bg-surface)',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              minHeight: '32px',
            }}
          >
            {color && (
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            )}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
