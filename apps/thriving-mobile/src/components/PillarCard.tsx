// ═══════════════════════════════════════════════════════════
// FILE: PillarCard.tsx
// PURPOSE: A large tappable card for one life pillar on the
//   Goals screen. Shows the pillar name, icon, goal count,
//   progress bar, and an edit icon that opens PillarEditSheet.
// CALLED BY: components/PillarList.tsx
// DATA FLOW: PillarList passes pillar data as props → user taps
//   card body → onTap drills into goals; user taps edit icon →
//   usePillarDetail store opens the PillarEditSheet
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import type { PillarWithProgress } from '@upp/db';
import { usePillarDetail } from '@/hooks/use-pillar-detail';
import ProgressBar from './ProgressBar';

interface PillarCardProps {
  pillar: PillarWithProgress;
  onTap: () => void;
}

/**
 * Triggered by: PillarList renders one per pillar at the root level.
 * Steps: displays the pillar icon, name, goal count, completion
 *   percentage, a ProgressBar, and a pencil edit icon. Tapping the
 *   card body drills into goals; tapping edit opens PillarEditSheet.
 * Returns: a tappable card element with an edit action.
 */
export default function PillarCard({ pillar, onTap }: PillarCardProps): React.JSX.Element {
  const openEdit = usePillarDetail((s) => s.open);
  const color = pillar.color || 'var(--accent)';
  const pct = pillar.taskCount > 0 ? Math.round((pillar.completedTaskCount / pillar.taskCount) * 100) : 0;
  return (
    <div className="w-full rounded-xl p-4 flex items-start gap-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <CardBody pillar={pillar} color={color} pct={pct} onTap={onTap} />
      <EditIcon onClick={() => openEdit(pillar)} label={`Edit ${pillar.name}`} />
    </div>
  );
}

/** Tappable card content — icon, name, goal count, progress */
function CardBody({ pillar, color, pct, onTap }: { pillar: PillarWithProgress; color: string; pct: number; onTap: () => void }) {
  return (
    <button type="button" onClick={onTap} aria-label={`Pillar: ${pillar.name}`} className="flex-1 text-left" style={{ minHeight: '44px' }}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{pillar.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{pillar.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{pillar.goalCount} {pillar.goalCount === 1 ? 'goal' : 'goals'}</p>
        </div>
        <span className="text-xs font-medium" style={{ color }}>{pct}%</span>
      </div>
      <ProgressBar completed={pillar.completedTaskCount} total={pillar.taskCount} color={color} />
    </button>
  );
}

/** Pencil icon button that opens the PillarEditSheet */
function EditIcon({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="flex items-center justify-center flex-shrink-0" style={{ minHeight: '44px', minWidth: '44px' }}>
      <Pencil size={16} style={{ color: 'var(--text-muted)' }} />
    </button>
  );
}
