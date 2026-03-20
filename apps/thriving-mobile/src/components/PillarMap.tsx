// ═══════════════════════════════════════════════════════════
// FILE: PillarMap.tsx
// PURPOSE: Level 1 of the Domino Tree — shows the user's name
//   as a root vertex at top center, with a stats line below,
//   then a 2-column grid of pillar cards with progress rings.
//   Only shows pillars that have at least one goal.
// CALLED BY: components/TreeContent.tsx
// DATA FLOW: TreeContent passes pillars + goals + onTap callback
//   → this filters pillars with goals, computes stats, renders grid
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { LifePillar, Goal, Task } from '@upp/db';
import VertexNode from './VertexNode';
import ProgressRing from './ProgressRing';

interface PillarMapProps {
  pillars: LifePillar[];
  goals: Goal[];
  tasks: Task[];
  onPillarTap: (id: string, name: string) => void;
}

/**
 * Triggered by: TreeContent renders this at Level 1 (root).
 * Steps: filters pillars to those with goals, computes overall
 *   stats, renders a user vertex then a 2-column grid of pillar
 *   nodes with progress rings and task fractions.
 * Returns: the pillar map view, or empty-state message.
 */
export default function PillarMap({ pillars, goals, tasks, onPillarTap }: PillarMapProps): React.JSX.Element {
  const withGoals = pillars.filter((p) => goals.some((g) => g.pillar_id === p.id));
  const done = tasks.filter((t) => t.status === 'done').length;
  const stats = `${withGoals.length} pillars · ${goals.length} goals · ${tasks.length} tasks`;

  if (withGoals.length === 0) {
    return <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No pillars with goals yet</p>;
  }

  return (
    <div>
      <VertexNode label="You" subtitle={stats} color="var(--accent)" completed={done} total={tasks.length} />
      <div className="grid grid-cols-2 gap-3">
        {withGoals.map((p, i) => {
          const pGoals = goals.filter((g) => g.pillar_id === p.id);
          const pTasks = tasks.filter((t) => pGoals.some((g) => g.id === t.goal_id));
          const pDone = pTasks.filter((t) => t.status === 'done').length;
          return (
            <PillarNode key={p.id} pillar={p} goalCount={pGoals.length}
              completed={pDone} total={pTasks.length} index={i}
              onTap={() => onPillarTap(p.id, p.name)} />
          );
        })}
      </div>
    </div>
  );
}

/** Single pillar card in the 2-column grid */
function PillarNode({ pillar, goalCount, completed, total, index, onTap }: {
  pillar: LifePillar; goalCount: number; completed: number; total: number; index: number; onTap: () => void;
}): React.JSX.Element {
  const color = pillar.color || 'var(--accent)';
  return (
    <button type="button" onClick={onTap} aria-label={`Pillar: ${pillar.name}`}
      className="rounded-xl p-3 text-center stagger-child"
      style={{ backgroundColor: 'var(--bg-surface)', minHeight: '44px', animationDelay: `${index * 50}ms` }}>
      <div className="flex justify-center mb-2">
        <ProgressRing completed={completed} total={total} color={color} size={44} />
      </div>
      <p className="text-xs font-bold" style={{ color }}>{completed}/{total}</p>
      <p className="text-xs font-semibold truncate mt-1" style={{ color: 'var(--text-primary)' }}>{pillar.name}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{goalCount} {goalCount === 1 ? 'goal' : 'goals'}</p>
    </button>
  );
}
