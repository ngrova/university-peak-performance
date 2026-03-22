// ═══════════════════════════════════════════════════════════
// FILE: AddPillarButton.tsx
// PURPOSE: Inline button + text input for quickly creating a
//   new pillar. Shows a text field on tap, saves on Enter or
//   blur, and disables during submission. Mirrors AddGoalButton.
// CALLED BY: components/PillarList.tsx
// DATA FLOW: User taps "Add pillar" → types a name → presses
//   Enter or blurs → createPillarAction server action saves to
//   Supabase → input clears on success, keeps text on error
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { createPillarAction } from '@/actions/pillar-crud-actions';

interface AddPillarButtonProps {
  onCreated: () => void;
}

/**
 * Triggered by: PillarList renders this below the pillar cards.
 * Steps: starts as a tappable "Add pillar" button. Tapping reveals
 *   a text input. User types a name and presses Enter or blurs.
 *   Calls createPillarAction, clears input on success, shows error
 *   on failure (keeping the typed text). Disables during save.
 * Returns: the add-pillar button or input field.
 */
export default function AddPillarButton({ onCreated }: AddPillarButtonProps): React.JSX.Element {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /** Saves the new pillar and resets on success */
  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) { setEditing(false); return; }
    if (saving) return;
    setSaving(true);
    setError('');
    const result = await createPillarAction(trimmed);
    if (result.error) { setError(result.error); setSaving(false); }
    else { setName(''); setSaving(false); setEditing(false); onCreated(); }
  }

  if (!editing) {
    return <IdleButton onActivate={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 50); }} />;
  }

  return <PillarInput ref={inputRef} name={name} saving={saving} error={error} onChange={setName} onSave={handleSave} />;
}

/** Tappable "Add pillar" button shown in idle state */
function IdleButton({ onActivate }: { onActivate: () => void }) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className="w-full flex items-center gap-2 rounded-xl p-4 mt-3"
      style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)', minHeight: '44px' }}
    >
      <Plus size={16} />
      <span className="text-sm">Add pillar</span>
    </button>
  );
}

/** Text input for typing a pillar name — saves on blur, Enter blurs to prevent double-fire */
const PillarInput = React.forwardRef<HTMLInputElement, {
  name: string; saving: boolean; error: string;
  onChange: (v: string) => void; onSave: () => void;
}>(function PillarInput({ name, saving, error, onChange, onSave }, ref) {
  return (
    <div className="mt-3">
      <input
        ref={ref}
        value={name}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        onBlur={onSave}
        disabled={saving}
        placeholder="Pillar name…"
        className="w-full rounded-xl p-4 text-sm outline-none"
        style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--accent)' }}
      />
      {error && <p className="text-xs mt-1 px-1" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
});
