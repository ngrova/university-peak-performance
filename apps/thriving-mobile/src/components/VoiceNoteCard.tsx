// ═══════════════════════════════════════════════════════════
// FILE: VoiceNoteCard.tsx
// PURPOSE: A compact card for one voice recording. Shows a play
//   button, decorative waveform, duration, and X to remove.
//   Tapping the card toggles audio playback.
// CALLED BY: components/CaptureMediaSection.tsx
// DATA FLOW: CaptureMediaSection passes voice note data → user
//   taps play → audio plays via object URL → X removes from store
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import type { VoiceNote } from '@/hooks/use-capture-media';

interface VoiceNoteCardProps {
  note: VoiceNote;
  transcript?: string | undefined;
  onRemove: () => void;
}

/** Static decorative waveform bar heights */
const BARS = [8, 14, 10, 18, 12, 16, 8, 14, 6, 10, 14, 8, 12, 16, 6];

/**
 * Triggered by: CaptureMediaSection renders one per voice recording.
 * Steps: shows a play/stop button, decorative waveform bars, and
 *   duration. Tapping play starts audio playback via the blob URL.
 *   X button removes the recording from the capture media store.
 * Returns: a compact voice note card element.
 */
export default function VoiceNoteCard({ note, transcript, onRemove }: VoiceNoteCardProps): React.JSX.Element {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  /** Pauses audio and releases the element */
  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; }
    setPlaying(false);
  }, []);

  /** Safety net: pause audio when the component unmounts */
  useEffect(() => () => stopAudio(), [stopAudio]);

  /** Toggles audio playback */
  function togglePlay() {
    if (!audioRef.current) {
      audioRef.current = new Audio(note.url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }

  /** Stops playback then removes the card */
  function handleRemove() { stopAudio(); onRemove(); }

  return (
    <div className="rounded-lg p-3 relative" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <PlayButton playing={playing} onToggle={togglePlay} />
        <Waveform />
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{formatDuration(note.duration)}</span>
        <RemoveButton onRemove={handleRemove} />
      </div>
      {transcript && <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{transcript}</p>}
    </div>
  );
}

/** Play/stop toggle button */
function PlayButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-label={playing ? 'Stop' : 'Play'} className="flex-shrink-0 flex items-center justify-center" style={{ minHeight: '36px', minWidth: '36px' }}>
      {playing ? <Square size={14} style={{ color: '#E24B4A' }} /> : <Play size={14} style={{ color: '#E24B4A' }} />}
    </button>
  );
}

/** Static decorative waveform */
function Waveform() {
  return (
    <div className="flex gap-0.5 items-center flex-1">
      {BARS.map((h, i) => <div key={i} className="rounded-sm" style={{ width: 3, height: h, backgroundColor: '#E24B4A' }} />)}
    </div>
  );
}

/** X button with confirm/cancel step — recordings can't be recreated */
function RemoveButton({ onRemove }: { onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="absolute -top-2 -right-2 flex gap-1">
        <button type="button" onClick={() => setConfirming(false)} aria-label="Cancel remove" className="px-2 py-0.5 text-xs rounded-full" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
          Cancel
        </button>
        <button type="button" onClick={onRemove} aria-label="Confirm remove" className="px-2 py-0.5 text-xs rounded-full text-white" style={{ backgroundColor: '#E24B4A' }}>
          Remove
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setConfirming(true)} aria-label="Remove recording" className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: '#E24B4A' }}>
      ×
    </button>
  );
}

/** Formats seconds as M:SS */
function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
