// ═══════════════════════════════════════════════════════════
// FILE: attachment-actions.ts
// PURPOSE: Server actions for uploading, fetching, and deleting
//   task media attachments (voice notes and photos). Files go to
//   the task-media Storage bucket; metadata rows go to task_attachments.
// CALLED BY: CapturePageContent.tsx (upload after Add),
//   TaskDetailSheet.tsx (fetch + delete attachments)
// DATA FLOW: Client sends file blob → server uploads to Storage →
//   creates task_attachments row → returns attachment metadata
// ═══════════════════════════════════════════════════════════
'use server';

import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';
import { createAttachment, getTaskAttachments, deleteAttachment } from '@upp/db';
import type { TaskAttachment } from '@upp/db';
import { revalidatePath } from 'next/cache';
import { reportError } from '@/lib/report-error';

/**
 * Triggered by: upload-media.ts after uploading a file to Storage from the browser.
 * Steps: gets auth, resolves delegation context, creates a task_attachments row
 *   linking the already-uploaded Storage file to the task.
 * Returns: the new attachment row, or { error } if insert fails.
 */
export async function createAttachmentRow(
  taskId: string,
  filePath: string,
  fileName: string,
  fileType: 'audio' | 'image',
  mimeType: string,
  fileSize: number,
  transcription?: string,
): Promise<{ data?: TaskAttachment; error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    const targetUserId = await getActingAsUserId(supabase, user.id);

    const attachment = await createAttachment(supabase, {
      task_id: taskId,
      user_id: targetUserId,
      file_path: filePath,
      file_type: fileType,
      mime_type: mimeType,
      file_size: fileSize,
      display_name: fileName,
      transcription,
    });

    revalidatePath('/today');
    return { data: attachment };
  } catch (err) {
    reportError(err);
    return { error: 'Failed to save attachment record — try again' };
  }
}

/**
 * Triggered by: task detail sheet opening (fetches attachments for display).
 * Steps: gets auth, queries task_attachments for the given task, generates
 *   signed URLs for each file so the client can play audio / show images.
 * Returns: array of attachments with signed URLs, or { error }.
 */
export async function fetchAttachments(
  taskId: string,
): Promise<{ data?: (TaskAttachment & { url: string })[]; error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };

    const attachments = await getTaskAttachments(supabase, taskId);

    // Generate signed URLs (1 hour expiry) for each file
    const withUrls = await Promise.all(
      attachments.map(async (a) => {
        const { data } = await supabase.storage
          .from('task-media')
          .createSignedUrl(a.file_path, 3600);
        return { ...a, url: data?.signedUrl ?? '' };
      }),
    );

    return { data: withUrls };
  } catch (err) {
    reportError(err);
    return { error: 'Failed to load attachments — try again' };
  }
}

/**
 * Triggered by: user deletes an attachment from the task detail sheet.
 * Steps: gets auth, deletes the file from Storage, removes the
 *   task_attachments row, refreshes the page cache.
 * Returns: empty object on success, or { error } on failure.
 */
export async function removeAttachment(
  attachmentId: string,
  filePath: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };

    // Delete file from Storage
    await supabase.storage.from('task-media').remove([filePath]);
    // Delete row from database
    await deleteAttachment(supabase, attachmentId);

    revalidatePath('/today');
    return {};
  } catch (err) {
    reportError(err);
    return { error: 'Failed to delete attachment — try again' };
  }
}
