// ===============================================================
// FILE: TaskCardChips.tsx
// PURPOSE: Renders small inline priority and assignee pills on
//   task cards in the list view, so users can see at a glance
//   which tasks are urgent and who owns them.
// CALLED BY: components/TaskSwipeRow.tsx
// DATA FLOW: TaskSwipeRow passes priority + assignee props ->
//   this component renders colored pills -> no callbacks needed
// ===============================================================
import React from 'react';

import type { TaskAssignee } from '@upp/db';

/** Maps priority number to label and color */
const PRIORITY_MAP: Record<1 | 2 | 3 | 4, { label: string; color: string }> = {
  1: { label: 'P1', color: '#E24B4A' },
  2: { label: 'P2', color: '#EF9F27' },
  3: { label: 'P3', color: '#5DCAA5' },
  4: { label: 'P4', color: '#888780' },
};

interface TaskCardChipsProps {
  priority: 1 | 2 | 3 | 4 | null;
  assignee: TaskAssignee | null;
  hasGoal?: boolean;
}

/**
 * Triggered by: TaskSwipeRow renders this below the task title.
 * Steps: checks if priority or assignee are set, renders colored
 *   pills for each. Skips rendering entirely if both are null.
 * Returns: a fragment of inline chip elements, or null.
 */
export default function TaskCardChips({ priority, assignee, hasGoal = true }: TaskCardChipsProps): React.JSX.Element | null {
  if (!priority && !assignee && hasGoal) return null;

  return (
    <>
      {!hasGoal && (
        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: 'rgba(239, 159, 39, 0.22)', color: '#EF9F27' }}>
          Unsorted
        </span>
      )}
      {priority && (
        <span
          className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `${PRIORITY_MAP[priority].color}38`,
            color: PRIORITY_MAP[priority].color,
          }}
        >
          {PRIORITY_MAP[priority].label}
        </span>
      )}
      {assignee && (
        <span
          className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-secondary)',
          }}
        >
          {assignee}
        </span>
      )}
    </>
  );
}
