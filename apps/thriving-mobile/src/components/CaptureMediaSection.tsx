// ═══════════════════════════════════════════════════════════
// FILE: CaptureMediaSection.tsx
// PURPOSE: The voice/photo/AI section at the top of the capture
//   sheet. Shows Voice and Scan buttons, stacked voice cards,
//   horizontal photo thumbnails, and "Process with AI" button.
// CALLED BY: components/CaptureSheet.tsx
// DATA FLOW: User records voice / snaps photos → media stored in
//   useCaptureMedia → "Process with AI" sends to server action →
//   AI suggestions populate form fields via onAIResult callback
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useRef, useState } from 'react';
import { Layers } from 'lucide-react';
import { useCaptureMedia } from '@/hooks/use-capture-media';
import type { VoiceNote } from '@/hooks/use-capture-media';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { processCapture } from '@/actions/process-capture-action';
import type { AISuggestion } from '@/actions/process-capture-action';
import VoiceNoteCard from './VoiceNoteCard';
import PhotoCapture from './PhotoCapture';
import CaptureButtons from './CaptureButtons';
import { blobToBase64 } from '@/lib/blob-utils';

interface CaptureMediaSectionProps {
  onAIResult: (suggestion: AISuggestion) => void;
}

/**
 * Triggered by: CaptureSheet renders this above the form fields.
 * Steps: shows Voice and Scan buttons. Voice button toggles recording.
 *   Scan button opens native camera. Completed recordings show as
 *   VoiceNoteCards. Photos show as horizontal thumbnails. "Process
 *   with AI" sends all media to Claude and returns suggestions.
 * Returns: the media capture + AI processing section.
 */
export default function CaptureMediaSection({ onAIResult }: CaptureMediaSectionProps): React.JSX.Element {
  const voiceNotes = useCaptureMedia((s) => s.voiceNotes);
  const photos = useCaptureMedia((s) => s.photos);
  const addVoice = useCaptureMedia((s) => s.addVoice);
  const addPhoto = useCaptureMedia((s) => s.addPhoto);
  const removeVoice = useCaptureMedia((s) => s.removeVoice);
  const removePhoto = useCaptureMedia((s) => s.removePhoto);
  const recorder = useVoiceRecorder();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const hasMedia = voiceNotes.length > 0 || photos.length > 0;

  /** Toggles voice recording on/off */
  async function handleVoice() {
    if (recorder.state.recording) {
      const result = await recorder.stop();
      if (result) addVoice(result.blob, result.duration, result.mimeType);
    } else { await recorder.start(); }
  }

  /** Converts blobs to base64 and sends to AI server action */
  async function handleProcess() {
    setProcessing(true); setError('');
    try {
      const voice = await Promise.all(voiceNotes.map(async (n) => ({ data: await blobToBase64(n.blob), mimeType: n.mimeType })));
      const images = await Promise.all(photos.map(async (p) => ({ data: await blobToBase64(p.file), mimeType: p.file.type })));
      const result = await processCapture({ voice, images });
      setProcessing(false);
      if ('error' in result) { setError(result.error); return; }
      onAIResult(result);
    } catch { setProcessing(false); setError('Content too large — remove a recording or photo'); }
  }

  return (
    <div className="mb-4">
      <CaptureButtons recording={recorder.state.recording} onVoice={handleVoice} onScan={() => photoInputRef.current?.click()} />
      {(recorder.state.error || error) && <ErrorText message={recorder.state.error || error} />}
      <VoiceStack notes={voiceNotes} onRemove={removeVoice} />
      <PhotoCapture photos={photos} onAdd={addPhoto} onRemove={removePhoto} />
      {hasMedia && <ProcessButton processing={processing} onClick={handleProcess} />}
      <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) addPhoto(f); e.target.value = ''; }} />
      {hasMedia && <div className="h-px mb-2" style={{ backgroundColor: 'var(--border)' }} />}
    </div>
  );
}

/** Vertical stack of voice note cards */
function VoiceStack({ notes, onRemove }: { notes: VoiceNote[]; onRemove: (id: string) => void }) {
  if (notes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mb-3">
      {notes.map((note) => <VoiceNoteCard key={note.id} note={note} onRemove={() => onRemove(note.id)} />)}
    </div>
  );
}

/** "Process with AI" button */
function ProcessButton({ processing, onClick }: { processing: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={processing} aria-label="Process with AI"
      className="w-full flex items-center justify-center gap-2 rounded-lg py-3 mb-3 font-medium text-sm"
      style={{ backgroundColor: 'var(--accent-muted, #1a2a3a)', border: '1px solid var(--accent-border, #85B7EB44)', color: 'var(--accent, #85B7EB)', minHeight: '48px' }}>
      <Layers size={18} />
      {processing ? 'Processing…' : 'Process with AI'}
    </button>
  );
}

/** Error text below buttons */
function ErrorText({ message }: { message: string }) {
  return <p className="text-xs mb-2 px-1" style={{ color: 'var(--danger)' }}>{message}</p>;
}
