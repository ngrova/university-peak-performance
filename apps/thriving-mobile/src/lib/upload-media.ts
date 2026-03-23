// ═══════════════════════════════════════════════════════════
// FILE: upload-media.ts
// PURPOSE: Uploads captured voice notes and photos directly from
//   the browser to Supabase Storage, then calls a server action
//   to create the task_attachments DB row. Bypasses the server
//   action payload limit that blocked base64 file transfers.
// CALLED BY: components/CaptureFormFields.tsx (after captureTask)
// DATA FLOW: Blobs from Zustand store → browser uploads to Storage
//   → server action creates task_attachments row with file metadata
// ═══════════════════════════════════════════════════════════

import { createBrowserClient } from '@upp/db';
import { createAttachmentRow } from '@/actions/attachment-actions';
import type { VoiceNote, CapturedPhoto } from '@/hooks/use-capture-media';
import { reportError } from '@/lib/report-error';

/**
 * Triggered by: CaptureFormFields after captureTask returns a task ID.
 * Steps: gets auth user from browser client, uploads each file blob
 *   directly to Storage (no base64, no server action for files), then
 *   calls createAttachmentRow to insert the DB metadata row.
 * Returns: nothing — errors logged to Sentry per-file.
 */
export async function uploadMedia(
  taskId: string,
  voiceNotes: VoiceNote[],
  photos: CapturedPhoto[],
  transcripts: string[],
): Promise<void> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Upload voice notes with transcripts
  for (const [i, note] of voiceNotes.entries()) {
    try {
      const ext = note.mimeType.includes('webm') ? 'webm' : 'mp4';
      const name = `voice-${Date.now()}-${i}.${ext}`;
      const path = `${user.id}/${taskId}/${name}`;
      const { error } = await supabase.storage
        .from('task-media')
        .upload(path, note.blob, { contentType: note.mimeType, upsert: false });
      if (error) { reportError(error); continue; }
      await createAttachmentRow(taskId, path, name, 'audio', note.mimeType, note.blob.size, transcripts[i]);
    } catch (err) { reportError(err); }
  }
  // Upload photos
  for (const [i, photo] of photos.entries()) {
    try {
      const name = `photo-${Date.now()}-${i}.${photo.file.type.includes('png') ? 'png' : 'jpg'}`;
      const path = `${user.id}/${taskId}/${name}`;
      const { error } = await supabase.storage
        .from('task-media')
        .upload(path, photo.file, { contentType: photo.file.type, upsert: false });
      if (error) { reportError(error); continue; }
      await createAttachmentRow(taskId, path, name, 'image', photo.file.type, photo.file.size);
    } catch (err) { reportError(err); }
  }
}
