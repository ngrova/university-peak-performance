// ═══════════════════════════════════════════════════════════
// FILE: TaskFilterChips.tsx
// PURPOSE: Horizontally scrollable filter buttons on the Tasks
//   screen — "All", "Active", "Blocked", "Completed". Tapping
//   one filters the task list to show only that status.
// CALLED BY: components/TasksContent.tsx
// DATA FLOW: User taps a chip → onChange sends the filter value
//   to TasksContent → TasksContent passes it to TasksList which
//   shows only matching tasks
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';

type FilterValue = 'all' | 'active' | 'blocked' | 'completed';

interface TaskFilterChipsProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Completed', value: 'completed' },
];

/**
 * Triggered by: TasksContent renders this below the search bar.
 * Steps: renders a row of pill-shaped buttons, one per filter option.
 *   The active filter gets a highlighted style. Tapping a different
 *   chip calls onChange with that filter's value.
 * Returns: a scrollable row of filter buttons.
 */
export default function TaskFilterChips({ value, onChange }: TaskFilterChipsProps): React.JSX.Element {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto" role="radiogroup" aria-label="Filter tasks">
      {FILTERS.map((f) => {
        const active = value === f.value;
        return (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(f.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{
              backgroundColor: active ? 'var(--accent-muted)' : 'var(--bg-surface)',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              minHeight: '32px',
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
