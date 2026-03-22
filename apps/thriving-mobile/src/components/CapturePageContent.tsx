// ═══════════════════════════════════════════════════════════
// FILE: CapturePageContent.tsx
// PURPOSE: The full-screen capture page — voice recording, camera,
//   AI processing, and task form fields. Replaces the old bottom
//   sheet overlay with a dedicated page at /capture.
// CALLED BY: app/(fullscreen)/capture/page.tsx
// DATA FLOW: User captures media → AI populates fields → user
//   reviews → taps Add → captureTask saves → toast → fields clear
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useCallback, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Goal } from '@upp/db';
import GoalPicker from './GoalPicker';
import PriorityChips from './PriorityChips';
import DeadlineChip from './DeadlineChip';
import AssigneeChips from './AssigneeChips';
import CaptureMediaSection from './CaptureMediaSection';
import SuccessToast from './SuccessToast';
import { useCaptureForm, FieldLabel, TitleInput } from './CaptureFormFields';
import type { AISuggestion } from '@/actions/process-capture-action';

/**
 * Triggered by: /capture page renders this client component.
 * Steps: shows a back button header, media capture section, and
 *   task form fields. After adding, shows "Task added" toast then
 *   clears for the next entry. Back button returns to previous page.
 * Returns: the full-screen capture page content.
 */
export default function CapturePageContent(): React.JSX.Element {
  const router = useRouter();
  const f = useCaptureForm();
  const goalsRef = useRef<Goal[]>([]);
  const [showToast, setShowToast] = useState(false);

  /** Navigates back or to /today if entered directly */
  function handleBack() {
    if (document.referrer && document.referrer.includes(window.location.host)) router.back();
    else router.push('/today');
  }

  /** Wraps handleAdd to show success toast on confirmed save */
  async function handleAddWithToast() {
    const success = await f.handleAdd();
    if (success) setShowToast(true);
  }

  /** Populates form fields from AI suggestions */
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

  const handleToastDone = useCallback(() => setShowToast(false), []);

  return (
    <div className="pt-2">
      <PageHeader onBack={handleBack} />
      <CaptureMediaSection onAIResult={handleAI} />
      <SuccessToast message="Task added" visible={showToast} onDone={handleToastDone} />
      <TitleInput ref={f.inputRef} value={f.title} onChange={f.setTitle} onSubmit={handleAddWithToast} />
      <div className="mb-3"><GoalPicker value={f.goalId} onChange={f.setGoalId} onGoalsLoaded={(g) => { goalsRef.current = g; }} /></div>
      <FieldLabel text="Priority" />
      <PriorityChips value={f.priority} onChange={f.setPriority} />
      <FieldLabel text="Deadline" />
      <DeadlineChip value={f.deadline} onChange={f.setDeadline} />
      <FieldLabel text="Assignee" />
      <AssigneeChips value={f.assignee} onChange={f.setAssignee} />
      <FieldLabel text="Notes" />
      <textarea value={f.notes} onChange={(e) => f.setNotes(e.target.value)} placeholder="Add notes, contacts, context..." rows={3}
        className="w-full rounded-lg px-3 py-2 text-sm resize-none mb-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
      {f.error && <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ color: 'var(--danger)', backgroundColor: 'rgba(232,72,72,0.1)' }}>{f.error}</p>}
      <button type="button" onClick={handleAddWithToast} disabled={!f.title.trim() || f.saving}
        className="w-full font-semibold rounded-lg transition-opacity disabled:opacity-50" style={{ backgroundColor: 'var(--accent)', color: '#0A0A0F', height: '48px' }}>
        {f.saving ? 'Adding\u2026' : 'Add task'}
      </button>
    </div>
  );
}

/** Back button + page title */
function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <button type="button" onClick={onBack} aria-label="Back" className="flex items-center justify-center" style={{ minHeight: '44px', minWidth: '44px' }}>
        <ArrowLeft size={24} style={{ color: 'var(--text-primary)' }} />
      </button>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Capture</h1>
    </div>
  );
}
