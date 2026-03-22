// ═══════════════════════════════════════════════════════════
// FILE: AssigneeChips.tsx
// PURPOSE: A horizontal row of tappable pills for selecting
//   the task assignee — Nick, Erin, or Liz. Single-select.
//   Tapping the active one clears the selection.
// CALLED BY: components/CaptureSheet.tsx, components/TaskDetailSheet.tsx
// DATA FLOW: CaptureSheet passes value + onChange → user taps
//   a pill → onChange fires with the assignee name (or null)
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { User } from 'lucide-react';
import type { TaskAssignee } from '@upp/db';

const ASSIGNEES: TaskAssignee[] = ['Nick', 'Erin', 'Liz'];

interface AssigneeChipsProps {
  value: TaskAssignee | null;
  onChange: (assignee: TaskAssignee | null) => void;
}

/**
 * Triggered by: CaptureSheet renders this in the capture form.
 * Steps: renders three pill buttons in a horizontal row. The active
 *   assignee shows with a highlighted border. Tapping a pill selects
 *   it; tapping the active one clears the selection.
 * Returns: a row of assignee pill buttons.
 */
export default function AssigneeChips({ value, onChange }: AssigneeChipsProps): React.JSX.Element {
  return (
    <div className="flex gap-2 mb-3">
      {ASSIGNEES.map((name) => {
        const active = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(active ? null : name)}
            aria-label={`Assign to ${name}`}
            aria-pressed={active}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: active ? 'var(--accent-muted, #1a2a3a)' : 'var(--bg-input)',
              border: `1px solid ${active ? 'var(--accent-border, #85B7EB44)' : 'var(--border)'}`,
              color: active ? 'var(--accent, #85B7EB)' : 'var(--text-secondary)',
              minHeight: '36px',
            }}
          >
            <User size={14} />
            {name}
          </button>
        );
      })}
    </div>
  );
}
