// ═══════════════════════════════════════════════════════════
// FILE: TaskAttachments.tsx
// PURPOSE: Fetches and displays media attachments (voice notes,
//   photos) for a task on the detail sheet. Voice notes show a
//   play button and transcript. Photos show tappable thumbnails.
// CALLED BY: components/TaskDetailSheet.tsx
// DATA FLOW: Task detail opens → useQuery fetches attachments →
//   renders SavedVoiceNote and SavedPhoto cards with signed URLs
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAttachments, removeAttachment } from '@/actions/attachment-actions';
import SavedVoiceNote from './SavedVoiceNote';
import SavedPhoto from './SavedPhoto';

/**
 * Triggered by: TaskDetailSheet renders this when a task is selected.
 * Steps: fetches attachments via server action, renders voice notes
 *   and photos. Each attachment has a delete button with confirmation.
 * Returns: the attachments section, or null if no attachments exist.
 */
export default function TaskAttachments({ taskId }: { taskId: string }): React.JSX.Element | null {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['attachments', taskId],
    queryFn: () => fetchAttachments(taskId),
  });
  const items = data?.data ?? [];
  if (items.length === 0) return null;

  // Deletes an attachment and refreshes the list
  async function handleDelete(attachmentId: string, filePath: string) {
    await removeAttachment(attachmentId, filePath);
    qc.invalidateQueries({ queryKey: ['attachments', taskId] });
  }

  const voices = items.filter((a) => a.file_type === 'audio');
  const photos = items.filter((a) => a.file_type === 'image');
  return (
    <div className="mt-3">
      <label className="text-xs block mb-2" style={{ color: 'var(--text-muted)' }}>Attachments</label>
      {voices.length > 0 && (
        <div className="flex flex-col gap-2 mb-2">
          {voices.map((a) => <SavedVoiceNote key={a.id} attachment={a} onDelete={() => handleDelete(a.id, a.file_path)} />)}
        </div>
      )}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((a) => <SavedPhoto key={a.id} attachment={a} onDelete={() => handleDelete(a.id, a.file_path)} />)}
        </div>
      )}
    </div>
  );
}
