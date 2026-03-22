// ═══════════════════════════════════════════════════════════
// FILE: CaptureMediaSection.tsx
// PURPOSE: The voice/photo/AI section at the top of the capture
//   sheet. Shows Voice and Scan buttons, stacked voice cards,
//   horizontal photo thumbnails, and "Process with AI" button.
// CALLED BY: components/CaptureSheet.tsx
// DATA FLOW: User records voice / snaps photos → media stored in
//   useCaptureMedia → "Process with AI" transcribes via Deepgram
//   then sends text + images to Claude → suggestions populate form
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useRef, useState } from 'react';
import { Layers } from 'lucide-react';
import { useCaptureMedia } from '@/hooks/use-capture-media';
import type { VoiceNote, CapturedPhoto } from '@/hooks/use-capture-media';
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

/** Granular selectors for the capture media Zustand store */
function useMediaState() {
  return {
    voiceNotes: useCaptureMedia((s) => s.voiceNotes),
    photos: useCaptureMedia((s) => s.photos),
    addVoice: useCaptureMedia((s) => s.addVoice),
    addPhoto: useCaptureMedia((s) => s.addPhoto),
    removeVoice: useCaptureMedia((s) => s.removeVoice),
    removePhoto: useCaptureMedia((s) => s.removePhoto),
  };
}

/** Converts voice blobs and photo files to base64 for the server action */
async function prepareMedia(voiceNotes: VoiceNote[], photos: CapturedPhoto[]) {
  const voice = await Promise.all(voiceNotes.map(async (n) => ({ data: await blobToBase64(n.blob), mimeType: n.mimeType })));
  const images = await Promise.all(photos.map(async (p) => ({ data: await blobToBase64(p.file), mimeType: p.file.type })));
  return { voice, images };
}

/** Manages voice recording, photo capture, and AI processing state */
function useCaptureProcessing(onAIResult: (s: AISuggestion) => void) {
  const m = useMediaState();
  const recorder = useVoiceRecorder();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [transcripts, setTranscripts] = useState<string[]>([]);
  async function handleVoice() {
    if (recorder.state.recording) {
      const r = await recorder.stop();
      if (r) m.addVoice(r.blob, r.duration, r.mimeType);
    } else { await recorder.start(); }
  }
  async function handleProcess() {
    setProcessing(true); setError('');
    try {
      const media = await prepareMedia(m.voiceNotes, m.photos);
      const result = await processCapture(media); setProcessing(false);
      if ('error' in result) { setError(result.error); return; }
      setTranscripts(result.transcripts); onAIResult(result.suggestion);
    } catch { setProcessing(false); setError('Content too large — remove a recording or photo'); }
  }
  return { ...m, recorder, processing, error, transcripts, handleVoice, handleProcess };
}

/**
 * Triggered by: CaptureSheet renders this above the form fields.
 * Steps: shows Voice and Scan buttons. Voice toggles recording.
 *   Scan opens camera. "Process with AI" transcribes voice via
 *   Deepgram, sends text + images to Claude for task extraction.
 * Returns: the media capture + AI processing section.
 */
export default function CaptureMediaSection({ onAIResult }: CaptureMediaSectionProps): React.JSX.Element {
  const c = useCaptureProcessing(onAIResult);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const hasMedia = c.voiceNotes.length > 0 || c.photos.length > 0;
  return (
    <div className="mb-4">
      <CaptureButtons recording={c.recorder.state.recording} onVoice={c.handleVoice} onScan={() => photoInputRef.current?.click()} />
      {(c.recorder.state.error || c.error) && <ErrorText message={c.recorder.state.error || c.error} />}
      <VoiceStack notes={c.voiceNotes} transcripts={c.transcripts} onRemove={c.removeVoice} />
      <PhotoCapture photos={c.photos} onAdd={c.addPhoto} onRemove={c.removePhoto} />
      {hasMedia && <ProcessButton processing={c.processing} onClick={c.handleProcess} />}
      <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) c.addPhoto(f); e.target.value = ''; }} />
      {hasMedia && <div className="h-px mb-2" style={{ backgroundColor: 'var(--border)' }} />}
    </div>
  );
}

/** Vertical stack of voice note cards */
function VoiceStack({ notes, transcripts, onRemove }: { notes: VoiceNote[]; transcripts: string[]; onRemove: (id: string) => void }) {
  if (notes.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mb-3">
      {notes.map((note, i) => <VoiceNoteCard key={note.id} note={note} transcript={transcripts[i]} onRemove={() => onRemove(note.id)} />)}
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
