// ═══════════════════════════════════════════════════════════
// FILE: TodayHero.tsx
// PURPOSE: The hero card for the One Thing — the single most
//   important task for today. Green-bordered card with title,
//   pillar → goal context, chips, "Why this?" explanation, and
//   a big "Mark Complete" button. Looks like a coach handing
//   you one card, not a task list.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: Scored task + why text → renders hero card →
//   complete button calls completeTask server action
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState } from 'react';
import { completeTask } from '@/actions/task-actions';
import { useTaskDetail } from '@/hooks/use-task-detail';
import type { ScoredTask } from '@/lib/one-thing-score';

interface TodayHeroProps {
  scored: ScoredTask;
  whyText: string;
  onCompleted: () => void;
}

// Priority chip colors matching TaskCardChips
const P_COLORS: Record<number, string> = { 1: '#E24B4A', 2: '#EF9F27', 3: '#5DCAA5', 4: '#888780' };

/**
 * Triggered by: TodayContent renders this with the top-scored task.
 * Steps: renders the green-bordered hero card with task title, context
 *   path, priority/assignee/deadline chips, "Why this?" explanation,
 *   and a Mark Complete button that calls the server action.
 * Returns: the hero card element.
 */
export default function TodayHero({ scored, whyText, onCompleted }: TodayHeroProps): React.JSX.Element {
  const [completing, setCompleting] = useState(false);
  const open = useTaskDetail((s) => s.open);
  const task = scored.task;
  const pillar = task.goals?.life_pillars;
  const goalTitle = task.goals?.title;
  const context = pillar && goalTitle ? `${pillar.icon} ${pillar.name} → ${goalTitle}` : goalTitle ?? '';

  // Handles the Mark Complete button tap
  async function handleComplete() {
    setCompleting(true);
    await completeTask(task.id);
    setCompleting(false);
    onCompleted();
  }

  // Keyboard activation for the tappable card
  function handleCardKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(task); }
  }

  return (
    <div className="text-center mb-7">
      <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#5DCAA5' }}>Your One Thing</div>
      <div className="rounded-2xl p-5" role="button" tabIndex={0} aria-label="Open task detail"
        onClick={() => open(task)} onKeyDown={handleCardKey}
        style={{ backgroundColor: 'var(--bg-surface)', border: '2px solid #5DCAA5', cursor: 'pointer' }}>
        <h2 className="text-xl font-bold mb-2 leading-snug" style={{ color: 'var(--text-primary)' }}>{task.title}</h2>
        {context && <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{context}</p>}
        <ChipRow task={task} />
        <div className="rounded-lg p-3 text-left text-sm mb-4" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: '#5DCAA5' }}>Why this?</strong> {whyText}
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); handleComplete(); }} disabled={completing}
          className="w-full font-bold rounded-xl text-lg disabled:opacity-50" style={{ backgroundColor: '#5DCAA5', color: '#0A0A0F', height: '52px' }}>
          {completing ? 'Completing…' : '✓ Mark Complete'}
        </button>
      </div>
    </div>
  );
}

/** Renders priority, assignee, and deadline chips in a centered row */
function ChipRow({ task }: { task: ScoredTask['task'] }): React.JSX.Element | null {
  const chips: React.JSX.Element[] = [];
  if (task.priority) {
    const c = P_COLORS[task.priority] ?? '#888';
    chips.push(<span key="p" className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${c}22`, color: c, border: `1px solid ${c}66` }}>P{task.priority}</span>);
  }
  if (task.assignee) chips.push(<span key="a" className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#ffffff15', color: '#ccc', border: '1px solid #ffffff30' }}>{task.assignee}</span>);
  if (task.due_date) {
    const d = new Date(task.due_date);
    const isOverdue = d < new Date(new Date().toDateString());
    const color = isOverdue ? '#E24B4A' : '#EF9F27';
    const label = isOverdue ? 'Overdue' : `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    chips.push(<span key="d" className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}66` }}>{label}</span>);
  }
  if (chips.length === 0) return null;
  return <div className="flex gap-1.5 justify-center flex-wrap mb-4">{chips}</div>;
}
