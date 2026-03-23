// ═══════════════════════════════════════════════════════════
// FILE: AssigneeFilterChips.tsx
// PURPOSE: Horizontally scrollable filter chips for filtering
//   tasks by assignee — "All", "Nick", "Erin", "Liz". Tapping
//   one shows only tasks assigned to that person.
// CALLED BY: components/TasksContent.tsx
// DATA FLOW: User taps a chip → onChange sends the assignee value
//   to TasksContent → TasksContent passes it to TasksList which
//   shows only matching tasks
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';

export type AssigneeFilter = 'all' | 'Nick' | 'Erin' | 'Liz';

interface AssigneeFilterChipsProps {
  value: AssigneeFilter;
  onChange: (value: AssigneeFilter) => void;
}

const FILTERS: { label: string; value: AssigneeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Nick', value: 'Nick' },
  { label: 'Erin', value: 'Erin' },
  { label: 'Liz', value: 'Liz' },
];

/**
 * Triggered by: TasksContent renders this below the status filter row.
 * Steps: renders a row of pill-shaped buttons, one per assignee option.
 *   The active filter gets a highlighted style. Tapping a different
 *   chip calls onChange with that assignee value.
 * Returns: a scrollable row of assignee filter buttons.
 */
export default function AssigneeFilterChips({ value, onChange }: AssigneeFilterChipsProps): React.JSX.Element {
  return (
    <div className="flex gap-2 mb-2 overflow-x-auto" role="radiogroup" aria-label="Filter by assignee">
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
