// ═══════════════════════════════════════════════════════════
// FILE: PillarList.tsx
// PURPOSE: Renders the root level of the Goals screen — a
//   vertical list of pillar cards with an "Add pillar" button
//   at the bottom, or an empty-state message if no pillars yet.
// CALLED BY: components/GoalsContent.tsx
// DATA FLOW: GoalsContent passes pillar array + callbacks →
//   this renders a PillarCard per pillar + AddPillarButton
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { PillarWithProgress } from '@upp/db';
import PillarCard from './PillarCard';
import AddPillarButton from './AddPillarButton';

interface PillarListProps {
  pillars: PillarWithProgress[];
  onPillarTap: (id: string, name: string) => void;
  onPillarCreated: () => void;
}

/**
 * Triggered by: GoalsContent renders this at drill-down level 1.
 * Steps: renders a PillarCard for each pillar in a vertical list,
 *   followed by an AddPillarButton for creating new pillars.
 *   Empty state shows a message plus the add button.
 * Returns: the pillar list section with add button.
 */
export default function PillarList({ pillars, onPillarTap, onPillarCreated }: PillarListProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {pillars.length === 0 && (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
          No life pillars yet — add one to start tracking goals
        </p>
      )}
      {pillars.map((pillar) => (
        <PillarCard key={pillar.id} pillar={pillar} onTap={() => onPillarTap(pillar.id, pillar.name)} />
      ))}
      <AddPillarButton onCreated={onPillarCreated} />
    </div>
  );
}
