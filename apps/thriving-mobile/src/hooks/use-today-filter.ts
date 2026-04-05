// ═══════════════════════════════════════════════════════════
// FILE: use-today-filter.ts
// PURPOSE: Tracks whether the Today tab shows "My Tasks" (assignee
//   filter on) or "All Tasks" (no filter). Only relevant when the
//   user is acting as a delegate — otherwise the toggle is hidden.
// CALLED BY: components/TodayContent.tsx, components/TodayFilterToggle.tsx
// DATA FLOW: TodayFilterToggle sets mode via setMode → TodayContent
//   reads mode → decides whether to apply assignee filter before ranking
// ═══════════════════════════════════════════════════════════
import { create } from 'zustand';

export type TodayFilterMode = 'mine' | 'all';

interface TodayFilterState {
  mode: TodayFilterMode;
  setMode: (mode: TodayFilterMode) => void;
}

/**
 * Triggered by: TodayContent or TodayFilterToggle imports this hook.
 * Steps: creates a global in-memory store holding the current filter
 *   mode. The default is 'mine' and resets to 'mine' on every page
 *   reload because no persistence middleware is applied.
 * Returns: a Zustand hook — components use selectors like
 *   useTodayFilter(s => s.mode) to subscribe granularly.
 */
export const useTodayFilter = create<TodayFilterState>((set) => ({
  mode: 'mine',
  setMode: (mode) => set({ mode }),
}));
