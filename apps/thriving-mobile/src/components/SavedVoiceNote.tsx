// ═══════════════════════════════════════════════════════════
// FILE: SavedVoiceNote.tsx
// PURPOSE: Plays a voice note attachment from a signed Storage URL
//   on the task detail sheet. Shows play/stop toggle, transcript
//   text, and a delete button with two-tap confirmation.
// CALLED BY: components/TaskAttachments.tsx
// DATA FLOW: Signed URL from fetchAttachments → Audio element plays →
//   delete button calls removeAttachment server action
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import type { TaskAttachment } from '@upp/db';

interface Props {
  attachment: TaskAttachment & { url: string };
  onDelete: () => void;
}

/**
 * Triggered by: TaskAttachments renders one per voice note attachment.
 * Steps: creates an Audio element from the signed URL. Play/stop
 *   toggle controls playback. Delete requires two taps (confirmation).
 * Returns: a voice note card with playback and delete controls.
 */
export default function SavedVoiceNote({ attachment, onDelete }: Props): React.JSX.Element {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Pauses audio and releases the element
  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; }
    setPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopAudio(), [stopAudio]);

  // Toggles audio playback from the signed URL
  function togglePlay() {
    if (!audioRef.current) {
      audioRef.current = new Audio(attachment.url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }

  // Stops audio then fires the delete callback
  function handleDelete() { stopAudio(); onDelete(); }

  return (
    <div className="rounded-lg p-3 relative" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <button type="button" onClick={togglePlay} aria-label={playing ? 'Stop' : 'Play'}
          className="flex-shrink-0 flex items-center justify-center" style={{ minHeight: '36px', minWidth: '36px' }}>
          {playing ? <Square size={14} style={{ color: '#E24B4A' }} /> : <Play size={14} style={{ color: '#E24B4A' }} />}
        </button>
        <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{attachment.display_name}</span>
        {confirming ? (
          <div className="flex gap-1">
            <button type="button" onClick={() => setConfirming(false)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--text-primary)' }}>Cancel</button>
            <button type="button" onClick={handleDelete} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--danger)' }}>Delete</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} aria-label="Remove" className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
            style={{ backgroundColor: '#E24B4A' }}>×</button>
        )}
      </div>
      {attachment.transcription && <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{attachment.transcription}</p>}
    </div>
  );
}
