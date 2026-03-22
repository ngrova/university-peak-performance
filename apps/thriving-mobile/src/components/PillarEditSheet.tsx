// ═══════════════════════════════════════════════════════════
// FILE: PillarEditSheet.tsx
// PURPOSE: Bottom sheet for editing a pillar's details — name,
//   icon, color, sort order (move up/down), and archive.
//   Changes auto-save on blur/change. Matches GoalEditSheet pattern.
// CALLED BY: app/(app)/layout.tsx (always mounted in the app shell)
// DATA FLOW: User taps edit icon on PillarCard → usePillarDetail
//   store holds it → this sheet reads it and renders fields →
//   on blur/change, updatePillarField server action saves to Supabase
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { usePillarDetail } from '@/hooks/use-pillar-detail';
import { updatePillarField, archivePillar } from '@/actions/pillar-crud-actions';
import { reorderPillar } from '@/actions/pillar-reorder-action';
import type { PillarWithProgress } from '@upp/db';
import GoalColorPicker from './GoalColorPicker';

/**
 * Triggered by: usePillarDetail store gets a pillar (user tapped edit icon).
 * Steps: reads the pillar from the store. If set, renders the sheet
 *   overlay with backdrop and delegates to SheetBody for form content.
 * Returns: the edit sheet overlay, or null when no pillar is selected.
 */
export default function PillarEditSheet(): React.JSX.Element | null {
  const pillar = usePillarDetail((s) => s.pillar);
  const close = usePillarDetail((s) => s.close);
  if (!pillar) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <SheetBody pillar={pillar} onClose={close} />
    </div>
  );
}

/** Encapsulates mutation state and handlers for pillar editing */
function usePillarActions(pillarId: string, onClose: () => void) {
  const [error, setError] = useState('');
  const [archiving, setArchiving] = useState(false);
  async function saveField(field: string, value: string) {
    setError('');
    const r = await updatePillarField(pillarId, field as Parameters<typeof updatePillarField>[1], value);
    if (r.error) setError(r.error);
  }
  async function handleArchive() {
    setArchiving(true); setError('');
    const r = await archivePillar(pillarId);
    if (r.error) { setError(r.error); setArchiving(false); } else { onClose(); }
  }
  async function handleReorder(direction: 'up' | 'down') {
    setError('');
    const r = await reorderPillar(pillarId, direction);
    if (r.error) setError(r.error);
  }
  return { error, archiving, saveField, handleArchive, handleReorder };
}

/** Form content — name, icon, color, reorder, archive */
function SheetBody({ pillar, onClose }: { pillar: PillarWithProgress; onClose: () => void }) {
  const { error, archiving, saveField, handleArchive, handleReorder } = usePillarActions(pillar.id, onClose);
  return (
    <div className="relative rounded-t-2xl p-5 sheet-enter max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <SheetHeader onClose={onClose} />
      {error && <ErrorBanner message={error} />}
      <NameField defaultValue={pillar.name} onSave={(v) => saveField('name', v)} />
      <IconField defaultValue={pillar.icon} onSave={(v) => saveField('icon', v)} />
      <GoalColorPicker value={pillar.color} onSave={(v) => saveField('color', v)} />
      <ReorderButtons onMove={handleReorder} />
      <ArchiveBtn archiving={archiving} onArchive={handleArchive} />
    </div>
  );
}

/** Header row with "Edit Pillar" label and close button */
function SheetHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Edit Pillar</h2>
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

/** Editable name input — saves on blur */
function NameField({ defaultValue, onSave }: { defaultValue: string; onSave: (v: string) => void }) {
  return (
    <input defaultValue={defaultValue} onBlur={(e) => onSave(e.target.value)} aria-label="Pillar name"
      className="w-full text-lg font-semibold bg-transparent border-none outline-none mb-4" style={{ color: 'var(--text-primary)' }} />
  );
}

/** Emoji icon input — saves on blur */
function IconField({ defaultValue, onSave }: { defaultValue: string; onSave: (v: string) => void }) {
  return (
    <div className="mb-3">
      <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Icon</label>
      <input defaultValue={defaultValue} onBlur={(e) => onSave(e.target.value)} aria-label="Icon"
        className="w-16 text-2xl text-center rounded-lg px-2 py-1" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }} />
    </div>
  );
}

/** Move up/down buttons for reordering */
function ReorderButtons({ onMove }: { onMove: (d: 'up' | 'down') => void }) {
  return (
    <div className="flex gap-2 mb-3">
      <button type="button" onClick={() => onMove('up')} aria-label="Move up" className="flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-sm"
        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', minHeight: '44px' }}>
        <ChevronUp size={16} /> Move up
      </button>
      <button type="button" onClick={() => onMove('down')} aria-label="Move down" className="flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-sm"
        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', minHeight: '44px' }}>
        <ChevronDown size={16} /> Move down
      </button>
    </div>
  );
}

/** Archive button with loading state */
function ArchiveBtn({ archiving, onArchive }: { archiving: boolean; onArchive: () => void }) {
  return (
    <button type="button" onClick={onArchive} disabled={archiving} className="w-full mt-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgba(232,72,72,0.1)', color: 'var(--danger)' }}>
      {archiving ? 'Archiving…' : 'Archive Pillar'}
    </button>
  );
}
