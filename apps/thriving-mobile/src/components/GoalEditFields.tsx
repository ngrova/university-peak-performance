// ═══════════════════════════════════════════════════════════
// FILE: GoalEditFields.tsx
// PURPOSE: Form field components for the GoalEditSheet — priority
//   rank selector, target date picker, and pillar picker. Each
//   field auto-saves on change to match the auto-save pattern.
// CALLED BY: components/GoalEditSheet.tsx
// DATA FLOW: GoalEditSheet passes current values + onSave callbacks →
//   user changes a field → onChange fires onSave → server action saves
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { LifePillar } from '@upp/db';

const inputStyle = {
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
};

/**
 * Triggered by: GoalEditSheet renders this in the edit form.
 * Steps: renders a dropdown with values 1-10 for priority ranking.
 *   Changing the selection immediately fires onSave.
 * Returns: a labeled select element.
 */
export function PriorityField({ defaultValue, onSave }: { defaultValue: number; onSave: (v: number) => void }) {
  return (
    <div className="mb-3">
      <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Priority (1–10)</label>
      <select
        defaultValue={defaultValue}
        onChange={(e) => onSave(Number(e.target.value))}
        aria-label="Priority"
        className="rounded-lg px-3 py-2 text-sm"
        style={inputStyle}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}

/**
 * Triggered by: GoalEditSheet renders this in the edit form.
 * Steps: renders a native date picker pre-filled with the goal's
 *   target date. Changing the date immediately fires onSave.
 * Returns: a labeled date input element.
 */
export function DateField({ defaultValue, onSave }: { defaultValue: string | null; onSave: (v: string | null) => void }) {
  return (
    <div className="mb-3">
      <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Target Date</label>
      <input
        type="date"
        defaultValue={defaultValue ?? ''}
        onChange={(e) => onSave(e.target.value || null)}
        aria-label="Target Date"
        className="rounded-lg px-3 py-2 text-sm"
        style={inputStyle}
      />
    </div>
  );
}

/**
 * Triggered by: GoalEditSheet renders this in the edit form.
 * Steps: renders a dropdown of all pillars so the user can move
 *   a goal to a different pillar. Changing fires onSave immediately.
 * Returns: a labeled select element, or null if pillars haven't loaded.
 */
export function PillarField({ pillars, defaultValue, onSave }: { pillars: LifePillar[]; defaultValue: string; onSave: (v: string) => void }) {
  if (pillars.length === 0) return null;
  return (
    <div className="mb-3">
      <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Pillar</label>
      <select
        defaultValue={defaultValue}
        onChange={(e) => onSave(e.target.value)}
        aria-label="Pillar"
        className="w-full rounded-lg px-3 py-2 text-sm"
        style={inputStyle}
      >
        {pillars.map((p) => (
          <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
        ))}
      </select>
    </div>
  );
}
