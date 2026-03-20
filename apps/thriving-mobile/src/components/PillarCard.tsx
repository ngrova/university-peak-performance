// ═══════════════════════════════════════════════════════════
// FILE: PillarCard.tsx
// PURPOSE: A large tappable card for one life pillar on the
//   Goals screen. Shows the pillar name, icon, goal count, and
//   a progress bar (tasks completed / total) in the pillar's
//   own accent color.
// CALLED BY: components/PillarList.tsx
// DATA FLOW: PillarList passes pillar data as props → user
//   taps → onTap fires → hook drills into that pillar's goals
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { PillarWithProgress } from '@upp/db';
import ProgressBar from './ProgressBar';

interface PillarCardProps {
  pillar: PillarWithProgress;
  onTap: () => void;
}

/**
 * Triggered by: PillarList renders one per pillar at the root level.
 * Steps: displays the pillar icon, name, goal count, completion
 *   percentage, and a ProgressBar in the pillar's own color.
 * Returns: a tappable card element.
 */
export default function PillarCard({ pillar, onTap }: PillarCardProps): React.JSX.Element {
  const color = pillar.color || 'var(--accent)';
  const pct = pillar.taskCount > 0
    ? Math.round((pillar.completedTaskCount / pillar.taskCount) * 100)
    : 0;

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`Pillar: ${pillar.name}`}
      className="w-full rounded-xl p-4 text-left"
      style={{ backgroundColor: 'var(--bg-surface)', minHeight: '44px' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{pillar.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {pillar.name}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {pillar.goalCount} {pillar.goalCount === 1 ? 'goal' : 'goals'}
          </p>
        </div>
        <span className="text-xs font-medium" style={{ color }}>{pct}%</span>
      </div>
      <ProgressBar completed={pillar.completedTaskCount} total={pillar.taskCount} color={color} />
    </button>
  );
}
