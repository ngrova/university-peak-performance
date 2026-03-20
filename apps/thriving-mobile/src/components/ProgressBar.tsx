// ═══════════════════════════════════════════════════════════
// FILE: ProgressBar.tsx
// PURPOSE: A thin horizontal progress bar used on pillar and
//   goal cards to show task completion (e.g., 60% of tasks done).
//   Color is customizable — pillar cards use the pillar's own color.
// CALLED BY: components/PillarCard.tsx, components/GoalCard.tsx
// DATA FLOW: Parent passes completed/total counts + accent color →
//   this computes the percentage and renders a filled bar
// ═══════════════════════════════════════════════════════════
import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  color: string;
}

/**
 * Triggered by: PillarCard and GoalCard render this to show progress.
 * Steps: computes (completed / total) as a percentage, renders a
 *   background track and a filled bar at that width.
 * Returns: a horizontal progress bar element.
 */
export default function ProgressBar({ completed, total, color }: ProgressBarProps): React.JSX.Element {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)' }}>
      <div
        className="h-1.5 rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
