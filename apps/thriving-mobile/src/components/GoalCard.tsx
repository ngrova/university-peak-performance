// ═══════════════════════════════════════════════════════════
// FILE: GoalCard.tsx
// PURPOSE: A tappable card for one goal inside a pillar detail
//   view. Shows the goal title, task count, progress bar, and
//   an edit icon that opens the GoalEditSheet.
// CALLED BY: components/PillarDetail.tsx
// DATA FLOW: PillarDetail passes goal data as props → user taps
//   card body → onTap drills into tasks; user taps edit icon →
//   useGoalDetail store opens the GoalEditSheet
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import type { GoalWithProgress } from '@upp/db';
import { useGoalDetail } from '@/hooks/use-goal-detail';
import ProgressBar from './ProgressBar';

interface GoalCardProps {
  goal: GoalWithProgress;
  pillarColor: string;
  onTap: () => void;
}

/**
 * Triggered by: PillarDetail renders one per goal.
 * Steps: displays the goal title, completed/total task count,
 *   a ProgressBar, and a pencil edit icon. Tapping the card body
 *   drills into tasks; tapping the edit icon opens GoalEditSheet.
 * Returns: a tappable card element with an edit action.
 */
export default function GoalCard({ goal, pillarColor, onTap }: GoalCardProps): React.JSX.Element {
  const openEdit = useGoalDetail((s) => s.open);
  const color = pillarColor || 'var(--accent)';
  return (
    <div className="w-full rounded-xl p-4 flex items-start gap-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <CardBody goal={goal} color={color} onTap={onTap} />
      <EditIcon onClick={() => openEdit(goal)} label={`Edit ${goal.title}`} />
    </div>
  );
}

/** Tappable card content — title, task count, progress bar */
function CardBody({ goal, color, onTap }: { goal: GoalWithProgress; color: string; onTap: () => void }) {
  return (
    <button type="button" onClick={onTap} aria-label={`Goal: ${goal.title}`} className="flex-1 text-left" style={{ minHeight: '44px' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold truncate flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>{goal.title}</p>
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{goal.completedTaskCount}/{goal.taskCount} tasks</span>
      </div>
      <ProgressBar completed={goal.completedTaskCount} total={goal.taskCount} color={color} />
    </button>
  );
}

/** Pencil icon button that opens the GoalEditSheet */
function EditIcon({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="flex items-center justify-center flex-shrink-0" style={{ minHeight: '44px', minWidth: '44px' }}>
      <Pencil size={16} style={{ color: 'var(--text-muted)' }} />
    </button>
  );
}
