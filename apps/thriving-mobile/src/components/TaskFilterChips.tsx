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

/** Horizontally scrollable filter chips for task status */
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
