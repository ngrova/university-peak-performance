// ═══════════════════════════════════════════════════════════
// FILE: GoalPicker.tsx
// PURPOSE: A dropdown menu for choosing which goal a new task
//   belongs to. Goals grouped by pillar. Includes "No goal"
//   option for unsorted tasks and "+ New Goal" button for
//   inline creation during capture.
// CALLED BY: components/CapturePageContent.tsx, components/TaskDetailSheet.tsx
// DATA FLOW: Mount → fetchGoalsForPicker → dropdown renders →
//   user picks goal/no-goal/new-goal → onChange fires
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useEffect, useImperativeHandle, useState } from 'react';
import type { Goal, LifePillar } from '@upp/db';
import { fetchGoalsForPicker } from '@/actions/goal-actions';

/** Minimal goal shape — only the fields the picker dropdown needs */
type PickerGoal = Pick<Goal, 'id' | 'title' | 'pillar_id'>;

interface GoalPickerProps {
  value: string;
  onChange: (goalId: string) => void;
  onGoalsLoaded?: (goals: Goal[]) => void;
  onNewGoal?: () => void;
}

/** Handle type for imperative reload and addGoal calls from parent */
export interface GoalPickerHandle {
  reload: () => void;
  addGoal: (id: string, title: string, pillarId: string) => void;
}

/**
 * Triggered by: CapturePageContent or TaskDetailSheet renders this.
 * Steps: loads pillars + goals, renders a <select> with "No goal"
 *   as first option, existing goals grouped by pillar, and a
 *   "+ New Goal" button below when onNewGoal is provided.
 * Returns: the goal picker dropdown + optional new goal button.
 */
const GoalPicker = React.forwardRef<GoalPickerHandle, GoalPickerProps>(function GoalPicker({ value, onChange, onGoalsLoaded, onNewGoal }, ref) {
  const [pillars, setPillars] = useState<LifePillar[]>([]);
  const [goals, setGoals] = useState<PickerGoal[]>([]);

  /** Reloads goals — called on mount and after inline creation */
  function reload() {
    fetchGoalsForPicker().then(({ pillars: p, goals: g }) => {
      setPillars(p);
      setGoals(g);
      onGoalsLoaded?.(g);
    });
  }

  /** Synchronously inserts a newly created goal so the select has a matching option immediately */
  function addGoal(id: string, title: string, pillarId: string) {
    setGoals((prev) => [...prev, { id, title, pillar_id: pillarId }]);
  }

  useImperativeHandle(ref, () => ({ reload, addGoal }));

  useEffect(() => { reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Goal"
        className="w-full rounded-lg px-3 text-sm"
        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', height: '40px' }}>
        <option value="">No goal — unsorted</option>
        {pillars.map((pillar) => {
          const pg = goals.filter((g) => g.pillar_id === pillar.id);
          if (pg.length === 0) return null;
          return (
            <optgroup key={pillar.id} label={pillar.name}>
              {pg.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </optgroup>
          );
        })}
      </select>
      {onNewGoal && (
        <button type="button" onClick={onNewGoal} className="text-xs mt-1 px-1" style={{ color: 'var(--accent)' }}>
          ＋ New goal
        </button>
      )}
    </div>
  );
});

export default GoalPicker;
export { type GoalPickerProps };
