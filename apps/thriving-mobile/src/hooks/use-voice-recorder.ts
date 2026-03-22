// ═══════════════════════════════════════════════════════════
// FILE: use-voice-recorder.ts
// PURPOSE: Wraps the MediaRecorder API for voice capture. Handles
//   browser codec detection (webm on Chrome, mp4 on Safari),
//   permission errors, and returns the recorded blob with duration.
// CALLED BY: components/CaptureMediaSection.tsx
// DATA FLOW: User taps record → getUserMedia → MediaRecorder starts →
//   user taps stop → blob assembled → returned to caller
// ═══════════════════════════════════════════════════════════
import { useState, useRef, useCallback } from 'react';

interface RecorderState {
  recording: boolean;
  error: string | null;
}

interface RecorderResult {
  state: RecorderState;
  start: () => Promise<void>;
  stop: () => Promise<{ blob: Blob; duration: number; mimeType: string } | null>;
}

/** Detects the best supported audio MIME type */
function getAudioMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
  return 'audio/webm';
}

/**
 * Triggered by: CaptureMediaSection when user taps the Voice button.
 * Steps: requests microphone permission, creates a MediaRecorder with
 *   the best supported codec, collects chunks during recording, and
 *   assembles a Blob on stop. Tracks duration via timestamps.
 * Returns: { state, start, stop } — start begins recording, stop
 *   returns the blob + duration + mimeType (or null if nothing recorded).
 */
export function useVoiceRecorder(): RecorderResult {
  const [state, setState] = useState<RecorderState>({ recording: false, error: null });
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    try {
      setState({ recording: true, error: null });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getAudioMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start();
      recorderRef.current = recorder;
      startTimeRef.current = Date.now();
    } catch {
      setState({ recording: false, error: 'Microphone access denied — check browser settings' });
    }
  }, []);

  const stop = useCallback(async (): Promise<{ blob: Blob; duration: number; mimeType: string } | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') { setState({ recording: false, error: null }); return null; }
    const mimeType = recorder.mimeType;
    return new Promise((resolve) => {
      recorder.onstop = () => {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setState({ recording: false, error: null });
        resolve({ blob, duration, mimeType });
      };
      recorder.stop();
    });
  }, []);

  return { state, start, stop };
}
