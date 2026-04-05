// ═══════════════════════════════════════════════════════════
// FILE: InlineGoalCreate.tsx
// PURPOSE: Minimal inline form for creating a goal without leaving
//   the capture flow. Shows a text input for goal name and pillar
//   chips. Calls createGoalAction and returns the new goal's ID.
// CALLED BY: components/CapturePageContent.tsx
// DATA FLOW: User types goal name → picks pillar chip → taps Create
//   → createGoalAction saves → onCreated(goalId) fires → parent
//   sets goalId and refreshes the goal picker
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { LifePillar } from '@upp/db';
import { fetchGoalsForPicker } from '@/actions/goal-actions';
import { createGoalAction } from '@/actions/goal-crud-actions';
import { reportError } from '@/lib/report-error';

interface Props {
  initialName?: string;
  onCreated: (goalId: string, title: string, pillarId: string) => void;
  onCancel: () => void;
}

interface PickerProps {
  loading: boolean;
  errorMsg: string | null;
  pillars: LifePillar[];
  pillarId: string;
  onSelect: (id: string) => void;
  onRetry: () => void;
}

/** Three-branch pillar selector: loading skeleton, error+retry, or chip row */
function PillarPicker({ loading, errorMsg, pillars, pillarId, onSelect, onRetry }: PickerProps): React.JSX.Element {
  if (loading) return <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Loading pillars…</p>;
  if (errorMsg) return (
    <div className="mb-2 flex items-center gap-2">
      <p className="text-xs" style={{ color: 'var(--danger)' }}>{errorMsg}</p>
      <button type="button" onClick={onRetry} className="text-xs font-medium px-2 py-0.5 rounded-md"
        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--accent)', border: '1px solid var(--border)' }}>Retry</button>
    </div>
  );
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {pillars.map((p) => (
        <button key={p.id} type="button" onClick={() => onSelect(p.id)} className="text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: pillarId === p.id ? p.color : 'var(--bg-input)', color: pillarId === p.id ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          {p.icon} {p.name}
        </button>
      ))}
    </div>
  );
}

/**
 * Triggered by: user taps "+ New Goal" in GoalPicker or AI suggests a new goal.
 * Steps: loads pillars for chip selector (with loading/error/retry UI),
 *   user types goal name + picks a pillar, taps Create → calls
 *   createGoalAction → fires onCreated with new goal ID.
 * Returns: inline form UI with name input, pillar chips, Create/Cancel buttons.
 */
export default function InlineGoalCreate({ initialName, onCreated, onCancel }: Props): React.JSX.Element {
  const [name, setName] = useState(initialName ?? '');
  const [pillarId, setPillarId] = useState('');
  const [pillars, setPillars] = useState<LifePillar[]>([]);
  const [pillarsLoading, setPillarsLoading] = useState(true);
  const [pillarsError, setPillarsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetches pillars; called on mount and on retry tap */
  const loadPillars = useCallback(async () => {
    setPillarsLoading(true); setPillarsError(null);
    try {
      const result = await fetchGoalsForPicker();
      if (result.error) { setPillarsError(result.error); return; }
      setPillars(result.pillars);
    } catch (err) {
      reportError(err);
      setPillarsError('Failed to load pillars — check your connection and try again');
    } finally {
      setPillarsLoading(false);
    }
  }, []);

  useEffect(() => { loadPillars(); }, [loadPillars]);

  /** Creates the goal and notifies the parent with full goal info */
  async function handleCreate() {
    if (!name.trim()) { setError('Enter a goal name'); return; }
    if (!pillarId) { setError('Pick a pillar'); return; }
    setSaving(true); setError(null);
    try {
      const result = await createGoalAction(pillarId, name.trim());
      if (result.error) { setError(result.error); return; }
      if (result.goalId) {
        onCreated(result.goalId, result.title ?? name.trim(), result.pillarId ?? pillarId);
      } else {
        setError('Goal created but missing ID — try again');
      }
    } catch (err) {
      reportError(err);
      setError('Failed to create goal — check your connection and try again');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>New goal</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Goal name"
        className="w-full rounded-lg px-3 text-sm mb-2"
        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', height: '36px' }} />
      <PillarPicker loading={pillarsLoading} errorMsg={pillarsError} pillars={pillars} pillarId={pillarId} onSelect={setPillarId} onRetry={loadPillars} />
      {error && <p className="text-xs mb-2" style={{ color: 'var(--danger)' }}>{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={handleCreate} disabled={saving || pillarsLoading || pillarsError !== null || pillars.length === 0}
          className="text-xs font-medium px-3 py-1 rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--accent)', color: '#0A0A0F' }}>
          {saving ? 'Creating…' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="text-xs px-3 py-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
