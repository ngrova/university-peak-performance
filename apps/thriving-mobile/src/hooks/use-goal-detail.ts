// ═══════════════════════════════════════════════════════════
// FILE: use-goal-detail.ts
// PURPOSE: Tracks which goal's edit sheet is open. When a user
//   taps the edit icon on a goal card, this store holds that
//   goal's data so the GoalEditSheet can display and edit it.
// CALLED BY: components/GoalCard.tsx, components/GoalEditSheet.tsx
// DATA FLOW: User taps edit icon → component calls open(goal) →
//   store holds the goal → GoalEditSheet reads it and renders
// ═══════════════════════════════════════════════════════════
import { create } from 'zustand';
import type { GoalWithProgress } from '@upp/db';

interface GoalDetailState {
  goal: GoalWithProgress | null;
  open: (goal: GoalWithProgress) => void;
  close: () => void;
}

/**
 * Triggered by: imported wherever a goal can be tapped to edit.
 * Steps: creates a global store holding one goal (or null). When
 *   a user taps the edit icon, the component calls open(goal).
 *   GoalEditSheet reads the stored goal and renders the editing sheet.
 * Returns: a Zustand hook — components use selectors like
 *   useGoalDetail(s => s.open) to get only what they need.
 */
export const useGoalDetail = create<GoalDetailState>((set) => ({
  goal: null,
  open: (goal) => set({ goal }),
  close: () => set({ goal: null }),
}));
