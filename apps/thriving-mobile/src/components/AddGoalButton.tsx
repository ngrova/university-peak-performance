// ═══════════════════════════════════════════════════════════
// FILE: AddGoalButton.tsx
// PURPOSE: Inline button + text input for quickly creating a
//   new goal inside a pillar. Shows a text field on tap, saves
//   on Enter or blur, and disables during submission.
// CALLED BY: components/PillarDetail.tsx
// DATA FLOW: User taps "Add goal" → types a title → presses
//   Enter or blurs → createGoalAction server action saves to
//   Supabase → input clears on success, keeps text on error
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { createGoalAction } from '@/actions/goal-crud-actions';

interface AddGoalButtonProps {
  pillarId: string;
  onCreated: () => void;
}

/**
 * Triggered by: PillarDetail renders this below the goal list.
 * Steps: starts as a tappable "Add goal" button. Tapping reveals
 *   a text input. User types a title and presses Enter or blurs.
 *   Calls createGoalAction, clears input on success, shows error
 *   on failure (keeping the typed text). Disables during save.
 * Returns: the add-goal button or input field.
 */
export default function AddGoalButton({ pillarId, onCreated }: AddGoalButtonProps): React.JSX.Element {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /** Saves the new goal and resets on success */
  async function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) { setEditing(false); return; }
    if (saving) return;
    setSaving(true);
    setError('');
    const result = await createGoalAction(pillarId, trimmed);
    if (result.error) { setError(result.error); setSaving(false); }
    else { setTitle(''); setSaving(false); setEditing(false); onCreated(); }
  }

  if (!editing) {
    return <IdleButton onActivate={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 50); }} />;
  }

  return <GoalInput ref={inputRef} title={title} saving={saving} error={error} onChange={setTitle} onSave={handleSave} />;
}

/** Tappable "Add goal" button shown in idle state */
function IdleButton({ onActivate }: { onActivate: () => void }) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className="w-full flex items-center gap-2 rounded-xl p-4 mt-3"
      style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)', minHeight: '44px' }}
    >
      <Plus size={16} />
      <span className="text-sm">Add goal</span>
    </button>
  );
}

/** Text input for typing a goal title — saves on blur, Enter blurs to prevent double-fire */
const GoalInput = React.forwardRef<HTMLInputElement, {
  title: string; saving: boolean; error: string;
  onChange: (v: string) => void; onSave: () => void;
}>(function GoalInput({ title, saving, error, onChange, onSave }, ref) {
  return (
    <div className="mt-3">
      <input
        ref={ref}
        value={title}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        onBlur={onSave}
        disabled={saving}
        placeholder="Goal title…"
        className="w-full rounded-xl p-4 text-sm outline-none"
        style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--accent)' }}
      />
      {error && <p className="text-xs mt-1 px-1" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
});
