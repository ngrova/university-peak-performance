// ═══════════════════════════════════════════════════════════
// FILE: GoalClusters.tsx
// PURPOSE: Level 2 of the Domino Tree — shows a pillar as the
//   root vertex, then a 2-column grid of goal cards. Each goal
//   has a progress ring, task fraction, and task dots showing
//   completion status.
// CALLED BY: components/TreeContent.tsx
// DATA FLOW: TreeContent passes pillar info + goals + tasks →
//   this renders the pillar vertex then goal cards in a grid
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { Goal, Task } from '@upp/db';
import VertexNode from './VertexNode';
import ProgressRing from './ProgressRing';

interface GoalClustersProps {
  pillarName: string;
  pillarColor: string;
  goals: Goal[];
  tasks: Task[];
  onGoalTap: (id: string, title: string) => void;
}

/**
 * Triggered by: TreeContent renders this at Level 2 (pillar detail).
 * Steps: computes total task stats for the pillar vertex, then
 *   renders a 2-column grid of goal nodes with progress and dots.
 * Returns: the goal clusters view, or empty-state message.
 */
export default function GoalClusters({ pillarName, pillarColor, goals, tasks, onGoalTap }: GoalClustersProps): React.JSX.Element {
  const color = pillarColor || 'var(--accent)';
  const done = tasks.filter((t) => t.status === 'done').length;
  const stats = `${goals.length} goals · ${tasks.length} tasks`;

  if (goals.length === 0) {
    return <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No goals in this pillar</p>;
  }

  return (
    <div>
      <VertexNode label={`${done}/${tasks.length}`} subtitle={`${pillarName} · ${stats}`} color={color} completed={done} total={tasks.length} />
      <div className="grid grid-cols-2 gap-3">
        {goals.map((g, i) => {
          const gTasks = tasks.filter((t) => t.goal_id === g.id);
          const gDone = gTasks.filter((t) => t.status === 'done').length;
          return (
            <GoalNode key={g.id} goal={g} color={color} completed={gDone}
              total={gTasks.length} index={i} onTap={() => onGoalTap(g.id, g.title)} />
          );
        })}
      </div>
    </div>
  );
}

/** Single goal card in the 2-column grid */
function GoalNode({ goal, color, completed, total, index, onTap }: {
  goal: Goal; color: string; completed: number; total: number; index: number; onTap: () => void;
}): React.JSX.Element {
  return (
    <button type="button" onClick={onTap} aria-label={`Goal: ${goal.title}`}
      className="rounded-xl p-3 text-center stagger-child"
      style={{ backgroundColor: 'var(--bg-surface)', minHeight: '44px', animationDelay: `${index * 50}ms` }}>
      <div className="flex justify-center mb-2">
        <ProgressRing completed={completed} total={total} color={color} size={40} />
      </div>
      <p className="text-xs font-bold" style={{ color }}>{completed}/{total}</p>
      <p className="text-xs font-semibold truncate mt-1" style={{ color: 'var(--text-primary)' }}>
        {goal.title.length > 35 ? goal.title.slice(0, 35) + '…' : goal.title}
      </p>
      <TaskDots completed={completed} total={total} color={color} />
    </button>
  );
}

/** Row of dots: filled = done, hollow = remaining */
function TaskDots({ completed, total, color }: { completed: number; total: number; color: string }): React.JSX.Element {
  const max = Math.min(total, 10);
  const filledCount = Math.min(completed, max);
  return (
    <div className="flex justify-center gap-1 mt-1.5">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: i < filledCount ? color : 'var(--bg-elevated)' }} />
      ))}
    </div>
  );
}
