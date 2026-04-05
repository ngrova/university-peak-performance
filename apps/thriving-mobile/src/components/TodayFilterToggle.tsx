// ═══════════════════════════════════════════════════════════
// FILE: TodayFilterToggle.tsx
// PURPOSE: Segmented control shown on the Today tab when the user
//   is acting as a delegate. Two options — "My Tasks" (assignee
//   filter on) and "All Tasks" (filter off) — let the delegate
//   focus on their own tasks or see everything in the account.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: User taps a pill → setMode updates Zustand store →
//   TodayContent re-renders with the new filter applied.
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { useTodayFilter, type TodayFilterMode } from '@/hooks/use-today-filter';

const OPTIONS: { label: string; value: TodayFilterMode }[] = [
  { label: 'My Tasks', value: 'mine' },
  { label: 'All Tasks', value: 'all' },
];

/**
 * Triggered by: TodayContent renders this when data.isDelegate is true.
 * Steps: reads the current mode from Zustand via a granular selector,
 *   renders two pill buttons, and on tap calls setMode with the chosen
 *   value. The active pill gets the accent-muted background.
 * Returns: a small radiogroup of two filter pills.
 */
export default function TodayFilterToggle(): React.JSX.Element {
  const mode = useTodayFilter((s) => s.mode);
  const setMode = useTodayFilter((s) => s.setMode);
  return (
    <div className="flex gap-2 mb-3" role="radiogroup" aria-label="Today filter">
      {OPTIONS.map((opt) => {
        const active = mode === opt.value;
        return (
          <button key={opt.value} type="button" role="radio" aria-checked={active}
            onClick={() => setMode(opt.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{
              backgroundColor: active ? 'var(--accent-muted)' : 'var(--bg-surface)',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              minHeight: '32px',
            }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
