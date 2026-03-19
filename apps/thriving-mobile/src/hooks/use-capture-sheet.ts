import { create } from 'zustand';

interface CaptureSheetState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/** Zustand store for capture bottom sheet open/close state */
export const useCaptureSheet = create<CaptureSheetState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
