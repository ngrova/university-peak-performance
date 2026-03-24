// ═══════════════════════════════════════════════════════════
// FILE: UpNextSection.tsx
// PURPOSE: The "Up Next" section below the One Thing hero card.
//   Shows 2-3 upcoming tasks as small, muted rows — clearly
//   secondary to the hero. Not interactive for completion, just
//   a preview of what's coming. Tapping opens the detail sheet.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: ScoredTask[] (positions 2-4) → renders small rows
//   with title, context, and chips → tap opens task detail
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { useTaskDetail } from '@/hooks/use-task-detail';
import type { ScoredTask } from '@/lib/one-thing-score';

// Priority chip colors
const P_COLORS: Record<number, string> = { 1: '#E24B4A', 2: '#EF9F27', 3: '#5DCAA5', 4: '#888780' };

/**
 * Triggered by: TodayContent renders this with tasks ranked 2-4.
 * Steps: renders a "Up Next" label and 2-3 small task rows with
 *   title, pillar → goal context, and small chips. Returns null
 *   if no upcoming tasks exist.
 * Returns: the up-next section, or null if empty.
 */
export default function UpNextSection({ items }: { items: ScoredTask[] }): React.JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Up Next</div>
      <div className="flex flex-col gap-2">
        {items.map((s) => <UpNextRow key={s.task.id} scored={s} />)}
      </div>
    </div>
  );
}

/** A single small, muted task row — tap opens the detail sheet */
function UpNextRow({ scored }: { scored: ScoredTask }): React.JSX.Element {
  const open = useTaskDetail((s) => s.open);
  const task = scored.task;
  const pillar = task.goals?.life_pillars;
  const context = pillar ? `${pillar.icon} ${pillar.name} → ${task.goals?.title}` : task.goals?.title ?? '';

  return (
    <button type="button" onClick={() => open(task)} className="w-full text-left rounded-lg p-3" style={{ backgroundColor: 'var(--bg-input)' }}>
      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
      {context && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{context}</p>}
      <SmallChips task={task} />
    </button>
  );
}

/** Tiny inline chips for priority, assignee, and deadline */
function SmallChips({ task }: { task: ScoredTask['task'] }): React.JSX.Element | null {
  const chips: React.JSX.Element[] = [];
  if (task.priority) {
    const c = P_COLORS[task.priority] ?? '#888';
    chips.push(<span key="p" className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${c}38`, color: c }}>P{task.priority}</span>);
  }
  if (task.assignee) chips.push(<span key="a" className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>{task.assignee}</span>);
  if (task.due_date) {
    const label = new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    chips.push(<span key="d" className="text-xs px-1.5 py-0.5 rounded-full" style={{ color: 'var(--text-muted)' }}>{label}</span>);
  }
  if (chips.length === 0) return null;
  return <div className="flex gap-1 mt-1">{chips}</div>;
}
