// ═══════════════════════════════════════════════════════════
// FILE: PillarDetail.tsx
// PURPOSE: The second drill-down level — shows a pillar's goals
//   as tappable cards with progress bars. Appears after the user
//   taps a pillar card on the root Goals screen.
// CALLED BY: components/GoalsContent.tsx
// DATA FLOW: GoalsContent passes goals array + pillar color →
//   this renders a GoalCard per goal → tap fires onGoalTap →
//   hook drills into that goal's tasks
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { GoalWithProgress } from '@upp/db';
import GoalCard from './GoalCard';

interface PillarDetailProps {
  goals: GoalWithProgress[];
  pillarColor: string;
  onGoalTap: (goalId: string, goalTitle: string) => void;
}

/**
 * Triggered by: GoalsContent renders this at drill-down level 2.
 * Steps: if no goals exist, shows an empty-state message. Otherwise
 *   renders a GoalCard for each goal in a vertical list with gaps.
 * Returns: the goal list section, or an empty-state message.
 */
export default function PillarDetail({ goals, pillarColor, onGoalTap }: PillarDetailProps): React.JSX.Element {
  if (goals.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        No active goals in this pillar yet
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          pillarColor={pillarColor}
          onTap={() => onGoalTap(goal.id, goal.title)}
        />
      ))}
    </div>
  );
}
