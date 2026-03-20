// ═══════════════════════════════════════════════════════════
// FILE: PillarList.tsx
// PURPOSE: Renders the root level of the Goals screen — a
//   vertical list of pillar cards, or an empty-state message
//   if the user has no life pillars yet.
// CALLED BY: components/GoalsContent.tsx
// DATA FLOW: GoalsContent passes pillar array + onPillarTap
//   callback → this renders a PillarCard per pillar
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { PillarWithProgress } from '@upp/db';
import PillarCard from './PillarCard';

interface PillarListProps {
  pillars: PillarWithProgress[];
  onPillarTap: (id: string, name: string) => void;
}

/**
 * Triggered by: GoalsContent renders this at drill-down level 1.
 * Steps: if no pillars exist, shows an empty-state message.
 *   Otherwise renders a PillarCard for each pillar in a vertical
 *   list with gaps.
 * Returns: the pillar list section, or an empty-state message.
 */
export default function PillarList({ pillars, onPillarTap }: PillarListProps): React.JSX.Element {
  if (pillars.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        No life pillars yet — set them up to start tracking goals
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {pillars.map((pillar) => (
        <PillarCard key={pillar.id} pillar={pillar} onTap={() => onPillarTap(pillar.id, pillar.name)} />
      ))}
    </div>
  );
}
