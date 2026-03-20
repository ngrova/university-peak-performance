// ═══════════════════════════════════════════════════════════
// FILE: CaptureSheet.tsx
// PURPOSE: The "quick add" bottom sheet — slides up from the
//   bottom so users can type a task title, pick a goal, and save.
//   Stays open after each save for rapid-fire task capture.
// CALLED BY: app/(app)/layout.tsx (always mounted in the app shell)
// DATA FLOW: User types title + picks goal → taps Add → captureTask
//   server action saves to Supabase → input clears for next entry
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCaptureSheet } from '@/hooks/use-capture-sheet';
import { captureTask } from '@/actions/task-actions';
import GoalPicker from './GoalPicker';

/**
 * Triggered by: useCaptureSheet store's isOpen becomes true (via tab
 *   bar or FAB button).
 * Steps: shows a text input and goal dropdown. On submit, calls
 *   captureTask server action, clears the input on success (keeps
 *   user's text on error), and auto-focuses for the next entry.
 * Returns: the bottom sheet overlay and form, or null when closed.
 */
export default function CaptureSheet(): React.JSX.Element | null {
  const isOpen = useCaptureSheet((s) => s.isOpen);
  const close = useCaptureSheet((s) => s.close);
  const [title, setTitle] = useState('');
  const [goalId, setGoalId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  /** Saves task and clears input for rapid capture */
  async function handleAdd() {
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    const result = await captureTask({ title: title.trim(), goal_id: goalId });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setTitle('');
    inputRef.current?.focus();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div
        className="relative rounded-t-2xl p-5 sheet-enter"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Capture
          </h2>
          <button type="button" onClick={close} aria-label="Close" style={{ minHeight: '44px', minWidth: '44px' }} className="flex items-center justify-center">
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="What needs to be done?"
          className="w-full rounded-lg px-4 text-sm mb-3"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', height: '48px' }}
        />

        <div className="mb-3">
          <GoalPicker value={goalId} onChange={setGoalId} />
        </div>

        {error && (
          <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ color: 'var(--danger)', backgroundColor: 'rgba(232,72,72,0.1)' }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={!title.trim() || saving}
          className="w-full font-semibold rounded-lg transition-opacity disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', color: '#0A0A0F', height: '48px' }}
        >
          {saving ? 'Adding\u2026' : 'Add'}
        </button>
      </div>
    </div>
  );
}
