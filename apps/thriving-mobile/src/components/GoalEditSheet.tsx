// ═══════════════════════════════════════════════════════════
// FILE: GoalEditSheet.tsx
// PURPOSE: Bottom sheet for editing a goal's details — title,
//   priority, target date, color, status, and parent pillar.
//   Changes auto-save on blur/change so users don't need a
//   save button. Matches the TaskDetailSheet interaction pattern.
// CALLED BY: app/(app)/layout.tsx (always mounted in the app shell)
// DATA FLOW: User taps edit icon on GoalCard → useGoalDetail
//   store holds it → this sheet reads it and renders fields →
//   on blur/change, updateGoalField server action saves to Supabase
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useGoalDetail } from '@/hooks/use-goal-detail';
import { updateGoalField, archiveGoal } from '@/actions/goal-crud-actions';
import { fetchGoalsForPicker } from '@/actions/goal-actions';
import type { LifePillar, GoalWithProgress } from '@upp/db';
import GoalColorPicker from './GoalColorPicker';
import { PriorityField, DateField, PillarField } from './GoalEditFields';

/**
 * Triggered by: useGoalDetail store gets a goal (user tapped edit icon).
 * Steps: reads the goal from the store. If set, renders the sheet
 *   overlay with backdrop and delegates to SheetBody for form content.
 * Returns: the edit sheet overlay, or null when no goal is selected.
 */
export default function GoalEditSheet(): React.JSX.Element | null {
  const goal = useGoalDetail((s) => s.goal);
  const close = useGoalDetail((s) => s.close);
  if (!goal) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <SheetBody goal={goal} onClose={close} />
    </div>
  );
}

/** Encapsulates mutation state and handlers for goal editing */
function useGoalActions(goalId: string, onClose: () => void) {
  const [error, setError] = useState('');
  const [archiving, setArchiving] = useState(false);
  async function saveField(field: string, value: string | number | null) {
    setError('');
    const r = await updateGoalField(goalId, field as Parameters<typeof updateGoalField>[1], value);
    if (r.error) setError(r.error);
  }
  async function handleArchive() {
    setArchiving(true); setError('');
    const r = await archiveGoal(goalId);
    if (r.error) { setError(r.error); setArchiving(false); } else { onClose(); }
  }
  return { error, archiving, saveField, handleArchive };
}

/** Form content inside the sheet — header, fields, pillar picker, archive */
function SheetBody({ goal, onClose }: { goal: GoalWithProgress; onClose: () => void }) {
  const [pillars, setPillars] = useState<LifePillar[]>([]);
  const { error, archiving, saveField, handleArchive } = useGoalActions(goal.id, onClose);
  useEffect(() => {
    fetchGoalsForPicker().then(({ pillars: p }) => setPillars(p)).catch(() => { /* pillar picker hidden */ });
  }, [goal]);
  return (
    <div className="relative rounded-t-2xl p-5 sheet-enter max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <SheetHeader onClose={onClose} />
      {error && <ErrorBanner message={error} />}
      <input defaultValue={goal.title} onBlur={(e) => saveField('title', e.target.value)} className="w-full text-lg font-semibold bg-transparent border-none outline-none mb-4" style={{ color: 'var(--text-primary)' }} />
      <PriorityField defaultValue={goal.priority_rank} onSave={(v) => saveField('priority_rank', v)} />
      <DateField defaultValue={goal.target_date} onSave={(v) => saveField('target_date', v)} />
      <GoalColorPicker value={goal.color} onSave={(v) => saveField('color', v)} />
      <PillarField pillars={pillars} defaultValue={goal.pillar_id} onSave={(v) => saveField('pillar_id', v)} />
      <ArchiveBtn archiving={archiving} onArchive={handleArchive} />
    </div>
  );
}

/** Header row with "Edit Goal" label and close button */
function SheetHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Edit Goal</h2>
      <button type="button" onClick={onClose} aria-label="Close" style={{ minHeight: '44px', minWidth: '44px' }} className="flex items-center justify-center">
        <X size={20} style={{ color: 'var(--text-secondary)' }} />
      </button>
    </div>
  );
}

/** Error banner shown when a save fails */
function ErrorBanner({ message }: { message: string }) {
  return <p className="text-sm px-3 py-2 mb-3 rounded-lg" style={{ color: 'var(--danger)', backgroundColor: 'rgba(232,72,72,0.1)' }}>{message}</p>;
}

/** Archive button with loading state */
function ArchiveBtn({ archiving, onArchive }: { archiving: boolean; onArchive: () => void }) {
  return (
    <button type="button" onClick={onArchive} disabled={archiving} className="w-full mt-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgba(232,72,72,0.1)', color: 'var(--danger)' }}>
      {archiving ? 'Archiving…' : 'Archive Goal'}
    </button>
  );
}
