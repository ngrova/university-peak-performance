// ═══════════════════════════════════════════════════════════
// FILE: transcribe-audio.ts
// PURPOSE: Sends audio to Deepgram's pre-recorded transcription
//   API and returns the transcript text. Used server-side only
//   because Claude API cannot process audio files directly.
// CALLED BY: actions/process-capture-action.ts
// DATA FLOW: Base64 audio → convert to binary → POST to Deepgram
//   /v1/listen → parse transcript from response JSON
// ═══════════════════════════════════════════════════════════
import { reportError } from './report-error';

interface TranscribeResult {
  transcript: string;
  error?: never;
}

interface TranscribeError {
  transcript?: never;
  error: string;
}

/**
 * Triggered by: processCapture server action for each voice recording.
 * Steps: converts base64 audio to a binary buffer, sends it to
 *   Deepgram's /v1/listen endpoint with the correct content type,
 *   parses the transcript from the response JSON.
 * Returns: { transcript } on success, or { error } on failure.
 */
export async function transcribeAudio(
  base64Data: string,
  mimeType: string,
): Promise<TranscribeResult | TranscribeError> {
  const apiKey = process.env['DEEPGRAM_API_KEY'];
  if (!apiKey) return { error: 'Transcription not configured' };

  try {
    const audioBuffer = Buffer.from(base64Data, 'base64');
    const contentType = mimeType.split(';')[0] || 'audio/webm';
    // Diagnostic: log MIME type to Sentry/stderr so we can debug device-specific failures
    reportError(new Error(`[diag] Deepgram request: content-type=${contentType}, raw-mime=${mimeType}, size=${audioBuffer.length}`));

    const resp = await fetch('https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&keyterm=Erin:2&keyterm=Liz:2&keyterm=Nick:2', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': contentType,
      },
      body: audioBuffer,
      signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => 'no body');
      reportError(new Error(`Deepgram API ${resp.status} (content-type: ${contentType}): ${errBody}`));
      return { error: 'Transcription failed — add fields manually' };
    }

    const body = await resp.json() as DeepgramResponse;
    const transcript = body?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    if (!transcript) return { error: 'Transcription returned empty — add fields manually' };
    return { transcript };
  } catch (err) {
    reportError(err);
    const isTimeout = err instanceof DOMException && err.name === 'TimeoutError';
    return { error: isTimeout ? 'Transcription timed out — add fields manually' : 'Transcription failed — add fields manually' };
  }
}

/** Minimal type for Deepgram response — only the fields we read */
interface DeepgramResponse {
  results?: {
    channels?: { alternatives?: { transcript?: string }[] }[];
  };
}
