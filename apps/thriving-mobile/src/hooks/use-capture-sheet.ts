// ═══════════════════════════════════════════════════════════
// FILE: use-capture-sheet.ts
// PURPOSE: Tracks whether the "add a task" bottom sheet is open
//   or closed. Any component can open/close it without passing
//   props through the tree.
// CALLED BY: components/CaptureSheet.tsx, components/BottomTabBar.tsx,
//   components/TasksContent.tsx
// DATA FLOW: BottomTabBar/TasksContent calls open() → store updates
//   → CaptureSheet reads isOpen and shows/hides itself
// ═══════════════════════════════════════════════════════════
import { create } from 'zustand';

interface CaptureSheetState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Triggered by: imported wherever the capture sheet needs to be
 *   opened (tab bar, FAB button) or read (CaptureSheet itself).
 * Steps: creates a tiny global store with isOpen, open(), and close().
 * Returns: a Zustand hook — components call useCaptureSheet(s => s.isOpen)
 *   to subscribe to just the piece they need.
 */
export const useCaptureSheet = create<CaptureSheetState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
