// ═══════════════════════════════════════════════════════════
// FILE: GoalsContent.tsx
// PURPOSE: The main Goals screen orchestrator — renders the
//   correct drill-down level (pillars, goals, or tasks) based
//   on navigation state. Handles loading, error, and empty
//   states. Uses 300ms spring transitions between levels.
// CALLED BY: app/(app)/goals/page.tsx
// DATA FLOW: Page renders this → hook manages drill-down state
//   and data fetching → this renders Breadcrumbs + the active
//   level's component (PillarList, PillarDetail, or GoalDetail)
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState, useEffect } from 'react';
import { useGoalsDrilldown } from '@/hooks/use-goals-drilldown';
import Breadcrumbs from './Breadcrumbs';
import PillarList from './PillarList';
import PillarDetail from './PillarDetail';
import GoalDetail from './GoalDetail';

/**
 * Triggered by: navigating to the Goals tab (page.tsx renders this).
 * Steps: calls the useGoalsDrilldown hook for state + data, renders
 *   breadcrumbs at the top, then switches between pillar list,
 *   goal list, or task list based on the current drill-down level.
 *   Applies a 300ms spring fade-in on level transitions.
 * Returns: the full Goals screen UI as a React element.
 */
export default function GoalsContent(): React.JSX.Element {
  const drill = useGoalsDrilldown();
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { setAnimKey((k) => k + 1); }, [drill.level]);
  const activePillar = drill.pillars.find((p) => drill.breadcrumbs.some((b) => b.id === p.id));
  const pillarColor = activePillar?.color ?? 'var(--accent)';

  return (
    <div className="pt-2 tab-enter">
      <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Goals</h1>
      <Breadcrumbs items={drill.breadcrumbs} onNavigate={drill.navigateTo} />
      {drill.error ? (
        <GoalsError message={drill.error.message} />
      ) : drill.isLoading ? (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div key={animKey} className="drill-enter">
          {drill.level === 'pillars' && <PillarList pillars={drill.pillars} onPillarTap={drill.drillIntoPillar} />}
          {drill.level === 'pillar' && <PillarDetail goals={drill.goals} pillarColor={pillarColor} onGoalTap={drill.drillIntoGoal} />}
          {drill.level === 'goal' && <GoalDetail tasks={drill.tasks} onTaskChanged={drill.refresh} />}
        </div>
      )}
    </div>
  );
}

/** Error banner shown when data fetching fails */
function GoalsError({ message }: { message: string }): React.JSX.Element {
  return (
    <p className="text-sm px-3 py-2 rounded-lg" style={{ color: 'var(--danger)', backgroundColor: 'rgba(232,72,72,0.1)' }}>
      {message}
    </p>
  );
}
