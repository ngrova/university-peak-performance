// ═══════════════════════════════════════════════════════════
// FILE: use-pillar-detail.ts
// PURPOSE: Tracks which pillar's edit sheet is open. When a user
//   taps the edit icon on a pillar card, this store holds that
//   pillar's data so the PillarEditSheet can display and edit it.
// CALLED BY: components/PillarCard.tsx, components/PillarEditSheet.tsx
// DATA FLOW: User taps edit icon → component calls open(pillar) →
//   store holds the pillar → PillarEditSheet reads it and renders
// ═══════════════════════════════════════════════════════════
import { create } from 'zustand';
import type { PillarWithProgress } from '@upp/db';

interface PillarDetailState {
  pillar: PillarWithProgress | null;
  open: (pillar: PillarWithProgress) => void;
  close: () => void;
}

/**
 * Triggered by: imported wherever a pillar can be tapped to edit.
 * Steps: creates a global store holding one pillar (or null). When
 *   a user taps the edit icon, the component calls open(pillar).
 *   PillarEditSheet reads the stored pillar and renders the sheet.
 * Returns: a Zustand hook — components use selectors like
 *   usePillarDetail(s => s.open) to get only what they need.
 */
export const usePillarDetail = create<PillarDetailState>((set) => ({
  pillar: null,
  open: (pillar) => set({ pillar }),
  close: () => set({ pillar: null }),
}));
