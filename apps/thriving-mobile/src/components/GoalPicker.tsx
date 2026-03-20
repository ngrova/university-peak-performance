// ═══════════════════════════════════════════════════════════
// FILE: GoalPicker.tsx
// PURPOSE: A dropdown menu for choosing which goal a new task
//   belongs to. Goals are grouped under their life pillar headings
//   (e.g., "Health > Run a marathon"). Loads data on mount.
// CALLED BY: components/CaptureSheet.tsx
// DATA FLOW: Component mounts → fetchGoalsForPicker server action
//   returns pillars + goals → dropdown renders grouped options →
//   user picks one → onChange sends goal ID back to parent
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useEffect, useState } from 'react';
import type { Goal, LifePillar } from '@upp/db';
import { fetchGoalsForPicker } from '@/actions/goal-actions';

interface GoalPickerProps {
  value: string;
  onChange: (goalId: string) => void;
}

/**
 * Triggered by: CaptureSheet renders this inside the capture form.
 * Steps: on mount, calls fetchGoalsForPicker to get pillars and goals
 *   from the server. Renders a <select> with <optgroup> per pillar.
 *   Auto-selects the first goal if nothing is selected yet.
 * Returns: a styled dropdown element.
 */
export default function GoalPicker({ value, onChange }: GoalPickerProps): React.JSX.Element {
  const [pillars, setPillars] = useState<LifePillar[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    fetchGoalsForPicker().then(({ pillars: p, goals: g }) => {
      setPillars(p);
      setGoals(g);
      if (!value && g.length > 0 && g[0]) onChange(g[0].id);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Goal"
      className="w-full rounded-lg px-3 text-sm"
      style={{
        backgroundColor: 'var(--bg-input)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        height: '40px',
      }}
    >
      {pillars.map((pillar) => {
        const pillarGoals = goals.filter((g) => g.pillar_id === pillar.id);
        if (pillarGoals.length === 0) return null;
        return (
          <optgroup key={pillar.id} label={pillar.name}>
            {pillarGoals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
