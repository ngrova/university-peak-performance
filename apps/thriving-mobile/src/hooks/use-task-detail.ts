import { create } from 'zustand';
import type { TaskWithContext } from '@upp/db';

interface TaskDetailState {
  task: TaskWithContext | null;
  open: (task: TaskWithContext) => void;
  close: () => void;
}

/** Zustand store for task detail bottom sheet */
export const useTaskDetail = create<TaskDetailState>((set) => ({
  task: null,
  open: (task) => set({ task }),
  close: () => set({ task: null }),
}));
