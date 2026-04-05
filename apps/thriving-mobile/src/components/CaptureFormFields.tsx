// ═══════════════════════════════════════════════════════════
// FILE: CaptureFormFields.tsx
// PURPOSE: The form field internals for the capture sheet —
//   state management hook, field labels, and title input.
//   Extracted from CaptureSheet to keep files under 100 lines.
// CALLED BY: components/CapturePageContent.tsx
// DATA FLOW: CaptureSheet renders these fields → user fills in
//   values → useCaptureForm hook manages state → handleAdd submits
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { captureTask } from '@/actions/task-actions';
import { useCaptureMedia } from '@/hooks/use-capture-media';
import { uploadMedia } from '@/lib/upload-media';
import type { TaskAssignee } from '@upp/db';

/**
 * Triggered by: CaptureSheet's CaptureForm component.
 * Steps: manages all form field state (title, goal, priority, deadline,
 *   assignee, notes), handles task submission via captureTask server
 *   action, and clears all fields + media blobs on success.
 * Returns: all field values, setters, and the handleAdd submit function.
 */
export function useCaptureForm() {
  const [title, setTitle] = useState('');
  const [goalId, setGoalId] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3 | 4 | null>(null);
  const [deadline, setDeadline] = useState('');
  const [assignee, setAssignee] = useState<TaskAssignee | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceNotes = useCaptureMedia((s) => s.voiceNotes);
  const photos = useCaptureMedia((s) => s.photos);
  const transcripts = useCaptureMedia((s) => s.transcripts);
  const clearMedia = useCaptureMedia((s) => s.clearAll);
  const qc = useQueryClient();
  /** Assembles captureTask input from current form state */
  function buildCaptureInput(): Parameters<typeof captureTask>[0] {
    // Goal is optional — empty string means "unsorted" (no goal)
    const input: Parameters<typeof captureTask>[0] = { title: title.trim(), goal_id: goalId || null };
    if (priority) input.priority = priority;
    if (deadline) input.due_date = deadline;
    if (assignee) input.assignee = assignee;
    if (notes.trim()) input.notes = notes.trim();
    return input;
  }
  /** Clears all form fields, media, and invalidates TanStack caches */
  function resetFormAndRefresh(): void {
    setTitle(''); setGoalId(''); setPriority(null); setDeadline(''); setAssignee(null); setNotes('');
    clearMedia();
    const keys = ['one-thing', 'queue', 'deadlines', 'all-tasks', 'pillars', 'goals', 'goal-tasks'];
    keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    inputRef.current?.focus();
  }
  async function handleAdd(): Promise<boolean> {
    if (!title.trim() || saving) return false;
    setSaving(true); setError(null);
    try {
      const result = await captureTask(buildCaptureInput());
      if (result.error) { setError(result.error); return false; }
      // Upload media before clearing — must complete before navigation kills it
      if (result.taskId) await uploadMedia(result.taskId, voiceNotes, photos, transcripts);
      resetFormAndRefresh();
      return true;
    } finally {
      setSaving(false);
    }
  }
  return { title, setTitle, goalId, setGoalId, priority, setPriority, deadline, setDeadline, assignee, setAssignee, notes, setNotes, saving, error, inputRef, handleAdd };
}

/** Small section label above form fields */
export function FieldLabel({ text }: { text: string }) {
  return <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>{text}</label>;
}

/** Title input with Enter-to-submit */
export const TitleInput = React.forwardRef<HTMLInputElement, { value: string; onChange: (v: string) => void; onSubmit: () => void }>(
  function TitleInput({ value, onChange, onSubmit }, ref) {
    return (
      <input ref={ref} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="What needs to be done?" className="w-full rounded-lg px-4 text-sm mb-3"
        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', height: '48px' }} />
    );
  },
);
