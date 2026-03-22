// ═══════════════════════════════════════════════════════════
// FILE: CaptureSheet.tsx
// PURPOSE: The capture bottom sheet — slides up so users can
//   record voice, snap photos, process with AI, and add tasks
//   with title, goal, priority, deadline, assignee, and notes.
// CALLED BY: app/(app)/layout.tsx (always mounted in the app shell)
// DATA FLOW: User captures media → AI populates fields → user
//   reviews → taps Add → captureTask saves → fields clear
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useEffect, useRef } from 'react';
import type { Goal } from '@upp/db';
import { X } from 'lucide-react';
import { useCaptureSheet } from '@/hooks/use-capture-sheet';
import GoalPicker from './GoalPicker';
import PriorityChips from './PriorityChips';
import DeadlineChip from './DeadlineChip';
import AssigneeChips from './AssigneeChips';
import CaptureMediaSection from './CaptureMediaSection';
import { useCaptureForm, FieldLabel, TitleInput } from './CaptureFormFields';
import type { AISuggestion } from '@/actions/process-capture-action';

/**
 * Triggered by: useCaptureSheet store's isOpen becomes true.
 * Steps: renders the overlay with backdrop, delegates to CaptureForm
 *   for media capture section + form fields + submission.
 * Returns: the bottom sheet overlay, or null when closed.
 */
export default function CaptureSheet(): React.JSX.Element | null {
  const isOpen = useCaptureSheet((s) => s.isOpen);
  const close = useCaptureSheet((s) => s.close);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <CaptureForm onClose={close} />
    </div>
  );
}

/** Renders media section + form fields inside the sheet */
function CaptureForm({ onClose }: { onClose: () => void }) {
  const f = useCaptureForm();
  const goalsRef = useRef<Goal[]>([]);
  useEffect(() => { f.inputRef.current?.focus(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Populates form fields from AI suggestions, matching goalTitle to goalId */
  function handleAI(s: AISuggestion) {
    if (s.title) f.setTitle(s.title);
    if (s.goalTitle) {
      const match = goalsRef.current.find((g) => g.title.toLowerCase() === s.goalTitle!.toLowerCase());
      if (match) f.setGoalId(match.id);
    }
    if (s.priority) f.setPriority(s.priority);
    if (s.deadline) f.setDeadline(s.deadline);
    if (s.assignee) f.setAssignee(s.assignee as Parameters<typeof f.setAssignee>[0]);
    if (s.notes) f.setNotes(s.notes);
  }

  return (
    <div className="relative rounded-t-2xl p-5 sheet-enter max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <SheetHeader onClose={onClose} />
      <CaptureMediaSection onAIResult={handleAI} />
      <TitleInput ref={f.inputRef} value={f.title} onChange={f.setTitle} onSubmit={f.handleAdd} />
      <div className="mb-3"><GoalPicker value={f.goalId} onChange={f.setGoalId} onGoalsLoaded={(g) => { goalsRef.current = g; }} /></div>
      <FieldLabel text="Priority" />
      <PriorityChips value={f.priority} onChange={f.setPriority} />
      <FieldLabel text="Deadline" />
      <DeadlineChip value={f.deadline} onChange={f.setDeadline} />
      <FieldLabel text="Assignee" />
      <AssigneeChips value={f.assignee} onChange={f.setAssignee} />
      <FieldLabel text="Notes" />
      <textarea value={f.notes} onChange={(e) => f.setNotes(e.target.value)} placeholder="Add notes, contacts, context..." rows={2}
        className="w-full rounded-lg px-3 py-2 text-sm resize-none mb-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
      {f.error && <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ color: 'var(--danger)', backgroundColor: 'rgba(232,72,72,0.1)' }}>{f.error}</p>}
      <button type="button" onClick={f.handleAdd} disabled={!f.title.trim() || f.saving}
        className="w-full font-semibold rounded-lg transition-opacity disabled:opacity-50" style={{ backgroundColor: 'var(--accent)', color: '#0A0A0F', height: '48px' }}>
        {f.saving ? 'Adding\u2026' : 'Add'}
      </button>
    </div>
  );
}

/** Header with title and close button */
function SheetHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Capture</h2>
      <button type="button" onClick={onClose} aria-label="Close" style={{ minHeight: '44px', minWidth: '44px' }} className="flex items-center justify-center">
        <X size={20} style={{ color: 'var(--text-secondary)' }} />
      </button>
    </div>
  );
}
