// ═══════════════════════════════════════════════════════════
// FILE: upload-media.ts
// PURPOSE: Best-effort upload of captured voice notes and photos
//   to Supabase Storage after a task is created. Awaited by the
//   capture form so uploads complete before navigation clears them.
// CALLED BY: components/CaptureFormFields.tsx (after captureTask)
// DATA FLOW: Blobs from Zustand store → base64 encoding → server
//   action uploads to Storage and creates task_attachments rows
// ═══════════════════════════════════════════════════════════

import { uploadAttachment } from '@/actions/attachment-actions';
import { blobToBase64 } from '@/lib/blob-utils';
import type { VoiceNote, CapturedPhoto } from '@/hooks/use-capture-media';
import { reportError } from '@/lib/report-error';

/**
 * Triggered by: CaptureFormFields after captureTask returns a task ID.
 * Steps: converts each voice note and photo blob to base64, then calls
 *   uploadAttachment for each file. Awaited by caller so uploads finish
 *   before form clears. Per-file errors logged to Sentry, not surfaced.
 * Returns: nothing (fire-and-forget).
 */
export async function uploadMedia(
  taskId: string,
  voiceNotes: VoiceNote[],
  photos: CapturedPhoto[],
  transcripts: string[],
): Promise<void> {
  // Upload voice notes with transcripts
  for (const [i, note] of voiceNotes.entries()) {
    try {
      const base64 = await blobToBase64(note.blob);
      const ext = note.mimeType.includes('webm') ? 'webm' : 'mp4';
      const name = `voice-${Date.now()}-${i}.${ext}`;
      await uploadAttachment(taskId, base64, name, 'audio', note.mimeType, note.blob.size, transcripts[i]);
    } catch (err) { reportError(err); }
  }
  // Upload photos
  for (const [i, photo] of photos.entries()) {
    try {
      const base64 = await blobToBase64(photo.file);
      const name = `photo-${Date.now()}-${i}.${photo.file.type.includes('png') ? 'png' : 'jpg'}`;
      await uploadAttachment(taskId, base64, name, 'image', photo.file.type, photo.file.size);
    } catch (err) { reportError(err); }
  }
}
