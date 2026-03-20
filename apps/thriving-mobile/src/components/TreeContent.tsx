// ═══════════════════════════════════════════════════════════
// FILE: TreeContent.tsx
// PURPOSE: The main Tree screen orchestrator — renders the
//   correct drill-down level (pillar map, goal clusters, task
//   chain, or fork detail) based on navigation state. Handles
//   loading, error, and empty states with spring transitions.
// CALLED BY: app/(app)/tree/page.tsx
// DATA FLOW: Page renders this → hook manages drill-down state
//   and data → this renders Breadcrumbs + the active level
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState, useEffect } from 'react';
import { useTreeDrilldown } from '@/hooks/use-tree-drilldown';
import Breadcrumbs from './Breadcrumbs';
import PillarMap from './PillarMap';
import GoalClusters from './GoalClusters';
import TaskChain from './TaskChain';
import ForkDetail from './ForkDetail';

/**
 * Triggered by: navigating to the Tree tab (page.tsx renders this).
 * Steps: calls useTreeDrilldown for state + data, renders breadcrumbs
 *   at top, then switches between the 4 drill-down levels with
 *   300ms spring fade-in transitions.
 * Returns: the full Tree screen UI.
 */
export default function TreeContent(): React.JSX.Element {
  const drill = useTreeDrilldown();
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { setAnimKey((k) => k + 1); }, [drill.level]);

  const activePillar = drill.pillars.find((p) => p.id === drill.pillarId);
  const color = activePillar?.color ?? 'var(--accent)';
  const activeGoal = drill.allGoals.find((g) => g.id === drill.goalId);
  const goalTasks = drill.allTasks.filter((t) => activeGoal && t.goal_id === activeGoal.id);

  if (drill.error) {
    return (
      <div className="pt-4">
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Tree</h1>
        <p className="text-sm px-3 py-2 rounded-lg" style={{ color: 'var(--danger)', backgroundColor: 'rgba(232,72,72,0.1)' }}>
          {drill.error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-2 tab-enter">
      <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Tree</h1>
      <Breadcrumbs items={drill.breadcrumbs} onNavigate={drill.navigateTo} />
      {drill.isLoading ? (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div key={animKey} className="drill-enter">
          {drill.level === 'pillars' && (
            <PillarMap pillars={drill.pillars} goals={drill.allGoals} tasks={drill.allTasks} onPillarTap={drill.drillPillar} />
          )}
          {drill.level === 'goals' && (
            <GoalClusters pillarName={activePillar?.name ?? ''} pillarColor={color}
              goals={drill.goals} tasks={goalTasks} onGoalTap={drill.drillGoal} />
          )}
          {drill.level === 'chain' && activeGoal && (
            <TaskChain goal={activeGoal} chain={drill.chain} color={color} onForkTap={drill.drillFork} />
          )}
          {drill.level === 'fork' && (
            <ForkDetail tracks={getForkTracks(drill.chain)} color={color} onTrackTap={drill.drillFork} />
          )}
        </div>
      )}
    </div>
  );
}

/** Extracts fork tracks from the last fork node in the chain */
function getForkTracks(chain: ReturnType<typeof import('@/lib/build-chain').buildChain>) {
  const forks = chain.filter((n) => n.type === 'fork');
  const last = forks[forks.length - 1];
  return last && last.type === 'fork' ? last.tracks : [];
}
