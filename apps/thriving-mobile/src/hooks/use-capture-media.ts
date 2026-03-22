// ═══════════════════════════════════════════════════════════
// FILE: use-capture-media.ts
// PURPOSE: Zustand store holding voice recordings and photos
//   captured during the capture flow. Media blobs stay accessible
//   until explicitly cleared (on task add or sheet close).
//   Future PRs can add a "save to storage" step before clearing.
// CALLED BY: components/CaptureMediaSection.tsx, components/CaptureSheet.tsx
// DATA FLOW: User records voice / snaps photo → blob added to store →
//   "Process with AI" reads blobs → "Add task" clears store
// ═══════════════════════════════════════════════════════════
import { create } from 'zustand';

export interface VoiceNote {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  mimeType: string;
}

export interface CapturedPhoto {
  id: string;
  file: File;
  url: string;
}

interface CaptureMediaState {
  voiceNotes: VoiceNote[];
  photos: CapturedPhoto[];
  addVoice: (blob: Blob, duration: number, mimeType: string) => void;
  removeVoice: (id: string) => void;
  addPhoto: (file: File) => void;
  removePhoto: (id: string) => void;
  clearAll: () => void;
}

/**
 * Triggered by: capture flow components that record audio or take photos.
 * Steps: holds arrays of voice blobs and photo files. Each entry has a
 *   stable ID and an object URL for playback/preview. clearAll revokes
 *   all object URLs to prevent memory leaks.
 * Returns: Zustand hook with granular selectors for voice/photo state.
 */
export const useCaptureMedia = create<CaptureMediaState>((set, get) => ({
  voiceNotes: [],
  photos: [],
  addVoice: (blob, duration, mimeType) => set((s) => ({
    voiceNotes: [...s.voiceNotes, { id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob), duration, mimeType }],
  })),
  removeVoice: (id) => set((s) => {
    const note = s.voiceNotes.find((v) => v.id === id);
    if (note) URL.revokeObjectURL(note.url);
    return { voiceNotes: s.voiceNotes.filter((v) => v.id !== id) };
  }),
  addPhoto: (file) => set((s) => ({
    photos: [...s.photos, { id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }],
  })),
  removePhoto: (id) => set((s) => {
    const photo = s.photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.url);
    return { photos: s.photos.filter((p) => p.id !== id) };
  }),
  clearAll: () => {
    const { voiceNotes, photos } = get();
    voiceNotes.forEach((v) => URL.revokeObjectURL(v.url));
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    set({ voiceNotes: [], photos: [] });
  },
}));
