// ═══════════════════════════════════════════════════════════
// FILE: CaptureSheet.tsx
// PURPOSE: The capture bottom sheet — slides up so users can
//   add tasks with title, goal, priority, deadline, assignee,
//   and notes. Stays open after each save for rapid-fire capture.
// CALLED BY: app/(app)/layout.tsx (always mounted in the app shell)
// DATA FLOW: User fills fields → taps Add → captureTask server
//   action saves to Supabase → all fields clear for next entry
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCaptureSheet } from '@/hooks/use-capture-sheet';
import { captureTask } from '@/actions/task-actions';
import type { TaskAssignee } from '@upp/db';
import GoalPicker from './GoalPicker';
import PriorityChips from './PriorityChips';
import DeadlineChip from './DeadlineChip';
import AssigneeChips from './AssigneeChips';

/**
 * Triggered by: useCaptureSheet store's isOpen becomes true.
 * Steps: shows form fields for task capture. On submit, calls
 *   captureTask server action with all field values. Clears all
 *   fields on success (keeps data on error) for rapid-fire entry.
 * Returns: the bottom sheet overlay and form, or null when closed.
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

/** Manages form state, submission, and field clearing */
function useCaptureForm() {
  const [title, setTitle] = useState('');
  const [goalId, setGoalId] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3 | 4 | null>(null);
  const [deadline, setDeadline] = useState('');
  const [assignee, setAssignee] = useState<TaskAssignee | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  async function handleAdd() {
    if (!title.trim() || saving) return;
    setSaving(true); setError(null);
    const input: Parameters<typeof captureTask>[0] = { title: title.trim(), goal_id: goalId };
    if (priority) input.priority = priority;
    if (deadline) input.due_date = deadline;
    if (assignee) input.assignee = assignee;
    if (notes.trim()) input.notes = notes.trim();
    const result = await captureTask(input);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setTitle(''); setPriority(null); setDeadline(''); setAssignee(null); setNotes('');
    inputRef.current?.focus();
  }
  return { title, setTitle, goalId, setGoalId, priority, setPriority, deadline, setDeadline, assignee, setAssignee, notes, setNotes, saving, error, inputRef, handleAdd };
}

/** Renders the form fields inside the sheet */
function CaptureForm({ onClose }: { onClose: () => void }) {
  const f = useCaptureForm();
  useEffect(() => { f.inputRef.current?.focus(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="relative rounded-t-2xl p-5 sheet-enter max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <SheetHeader onClose={onClose} />
      <TitleInput ref={f.inputRef} value={f.title} onChange={f.setTitle} onSubmit={f.handleAdd} />
      <div className="mb-3"><GoalPicker value={f.goalId} onChange={f.setGoalId} /></div>
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

/** Small section label above form fields */
function FieldLabel({ text }: { text: string }) {
  return <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>{text}</label>;
}

/** Title input with Enter-to-submit */
const TitleInput = React.forwardRef<HTMLInputElement, { value: string; onChange: (v: string) => void; onSubmit: () => void }>(
  function TitleInput({ value, onChange, onSubmit }, ref) {
    return (
      <input ref={ref} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="What needs to be done?" className="w-full rounded-lg px-4 text-sm mb-3"
        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', height: '48px' }} />
    );
  },
);
