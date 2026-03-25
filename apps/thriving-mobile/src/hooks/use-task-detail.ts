// ═══════════════════════════════════════════════════════════
// FILE: use-task-detail.ts
// PURPOSE: Tracks which task's detail sheet is open. When a user
//   taps a task anywhere in the app, this store holds that task's
//   data so the detail sheet can display and edit it.
// CALLED BY: components/OneThingCard.tsx, components/TaskRow.tsx,
//   components/TaskDetailSheet.tsx, components/TaskSwipeRow.tsx
// DATA FLOW: User taps a task → component calls open(task) → store
//   holds the task → TaskDetailSheet reads it and renders the sheet.
//   When user edits a field, updateField patches the snapshot so
//   controlled components (chips, pickers) reflect the change instantly.
// ═══════════════════════════════════════════════════════════
import { create } from 'zustand';
import type { TaskWithContext } from '@upp/db';

interface TaskDetailState {
  task: TaskWithContext | null;
  open: (task: TaskWithContext) => void;
  close: () => void;
  /** Patches a single field on the stored task for optimistic UI updates */
  updateField: (field: string, value: string | number | boolean | null) => void;
}

/**
 * Triggered by: imported wherever a task can be tapped to view details.
 * Steps: creates a global store holding one task (or null). When a user
 *   taps a task, the component calls open(task). TaskDetailSheet reads
 *   the stored task and renders the editing sheet.
 * Returns: a Zustand hook — components use selectors like
 *   useTaskDetail(s => s.open) to get only what they need.
 */
export const useTaskDetail = create<TaskDetailState>((set) => ({
  task: null,
  open: (task) => set({ task }),
  close: () => set({ task: null }),
  /** Patches one field on the stored task so chip highlights move instantly */
  updateField: (field, value) =>
    set((state) => {
      if (!state.task) return state;
      return { task: { ...state.task, [field]: value } };
    }),
}));
