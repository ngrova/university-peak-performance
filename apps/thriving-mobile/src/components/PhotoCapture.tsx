// ═══════════════════════════════════════════════════════════
// FILE: PhotoCapture.tsx
// PURPOSE: Horizontal scrolling row of captured photo thumbnails.
//   Each thumbnail has an X to remove. The camera button opens
//   the native file picker with camera capture.
// CALLED BY: components/CaptureMediaSection.tsx
// DATA FLOW: User taps Scan → native camera opens → photo file
//   added to store → thumbnail appears → X removes from store
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useRef } from 'react';
import type { CapturedPhoto } from '@/hooks/use-capture-media';

interface PhotoCaptureProps {
  photos: CapturedPhoto[];
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
}

/**
 * Triggered by: CaptureMediaSection renders this below voice notes.
 * Steps: renders a horizontal scrolling row of photo thumbnails.
 *   Each shows the captured image with an X to remove. The hidden
 *   file input accepts images with camera capture attribute.
 * Returns: a horizontal thumbnail row, or null if no photos.
 */
export default function PhotoCapture({ photos, onAdd, onRemove }: PhotoCaptureProps): React.JSX.Element | null {
  const inputRef = useRef<HTMLInputElement>(null);
  if (photos.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Photos</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {photos.map((photo) => (
          <Thumbnail key={photo.id} photo={photo} onRemove={() => onRemove(photo.id)} />
        ))}
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onAdd(f); e.target.value = ''; }} />
    </div>
  );
}

/** Single photo thumbnail with X to remove */
function Thumbnail({ photo, onRemove }: { photo: CapturedPhoto; onRemove: () => void }) {
  return (
    <div className="relative flex-shrink-0 w-18 h-18 rounded-lg overflow-hidden" style={{ width: 72, height: 72, border: '1px solid var(--border)' }}>
      <img src={photo.url} alt="Captured" className="w-full h-full object-cover" />
      <button type="button" onClick={onRemove} aria-label="Remove photo"
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: '#E24B4A' }}>
        ×
      </button>
    </div>
  );
}
