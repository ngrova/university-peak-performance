'use client';

import React, { useEffect, useState } from 'react';
import type { Goal, LifePillar } from '@upp/db';
import { fetchGoalsForPicker } from '@/actions/task-actions';

interface GoalPickerProps {
  value: string;
  onChange: (goalId: string) => void;
}

/** Dropdown to pick a goal, grouped by pillar */
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
