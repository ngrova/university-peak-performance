// ═══════════════════════════════════════════════════════════
// FILE: PillarDetail.tsx
// PURPOSE: The second drill-down level — shows a pillar's goals
//   as tappable cards with progress bars, plus an "Add goal"
//   button at the bottom for creating new goals.
// CALLED BY: components/GoalsContent.tsx
// DATA FLOW: GoalsContent passes goals array + pillar info →
//   this renders GoalCards + AddGoalButton → tap fires onGoalTap →
//   hook drills into that goal's tasks
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { GoalWithProgress } from '@upp/db';
import GoalCard from './GoalCard';
import AddGoalButton from './AddGoalButton';

interface PillarDetailProps {
  goals: GoalWithProgress[];
  pillarId: string;
  pillarColor: string;
  onGoalTap: (goalId: string, goalTitle: string) => void;
  onGoalCreated: () => void;
}

/**
 * Triggered by: GoalsContent renders this at drill-down level 2.
 * Steps: renders a GoalCard for each goal in a vertical list,
 *   followed by an AddGoalButton for creating new goals.
 *   Empty state shows a message plus the add button.
 * Returns: the goal list section with add button.
 */
export default function PillarDetail({ goals, pillarId, pillarColor, onGoalTap, onGoalCreated }: PillarDetailProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {goals.length === 0 && (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
          No active goals in this pillar yet
        </p>
      )}
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          pillarColor={pillarColor}
          onTap={() => onGoalTap(goal.id, goal.title)}
        />
      ))}
      <AddGoalButton pillarId={pillarId} onCreated={onGoalCreated} />
    </div>
  );
}
