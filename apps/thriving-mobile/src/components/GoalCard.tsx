// ═══════════════════════════════════════════════════════════
// FILE: GoalCard.tsx
// PURPOSE: A tappable card for one goal inside a pillar detail
//   view. Shows the goal title, task count, and a progress bar
//   showing how many tasks are done.
// CALLED BY: components/PillarDetail.tsx
// DATA FLOW: PillarDetail passes goal data as props → user taps
//   → onTap fires → hook drills into that goal's tasks
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { GoalWithProgress } from '@upp/db';
import ProgressBar from './ProgressBar';

interface GoalCardProps {
  goal: GoalWithProgress;
  pillarColor: string;
  onTap: () => void;
}

/**
 * Triggered by: PillarDetail renders one per goal.
 * Steps: displays the goal title, completed/total task count,
 *   and a ProgressBar using the parent pillar's color.
 * Returns: a tappable card element.
 */
export default function GoalCard({ goal, pillarColor, onTap }: GoalCardProps): React.JSX.Element {
  const color = pillarColor || 'var(--accent)';

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`Goal: ${goal.title}`}
      className="w-full rounded-xl p-4 text-left"
      style={{ backgroundColor: 'var(--bg-surface)', minHeight: '44px' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold truncate flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>
          {goal.title}
        </p>
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {goal.completedTaskCount}/{goal.taskCount} tasks
        </span>
      </div>
      <ProgressBar completed={goal.completedTaskCount} total={goal.taskCount} color={color} />
    </button>
  );
}
