// ═══════════════════════════════════════════════════════════
// FILE: SavedPhoto.tsx
// PURPOSE: Displays a photo attachment as a tappable thumbnail
//   on the task detail sheet. Tapping expands to full size in
//   a modal overlay. Delete button with two-tap confirmation.
// CALLED BY: components/TaskAttachments.tsx
// DATA FLOW: Signed URL from fetchAttachments → img element renders →
//   tap opens full-size modal → delete calls removeAttachment
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { TaskAttachment } from '@upp/db';

interface Props {
  attachment: TaskAttachment & { url: string };
  onDelete: () => void;
}

/**
 * Triggered by: TaskAttachments renders one per photo attachment.
 * Steps: shows a 64x64 thumbnail. Tapping opens a full-screen modal.
 *   Delete requires two taps (confirmation). Modal closes on backdrop tap.
 * Returns: a photo thumbnail with expand and delete controls.
 */
export default function SavedPhoto({ attachment, onDelete }: Props): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <div className="relative flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={attachment.url} alt={attachment.display_name} onClick={() => setExpanded(true)}
          className="w-16 h-16 rounded-lg object-cover cursor-pointer" />
        {confirming ? (
          <div className="absolute -top-2 -right-2 flex gap-0.5">
            <button type="button" onClick={() => setConfirming(false)} className="text-xs bg-gray-700 text-white px-1 rounded">✕</button>
            <button type="button" onClick={onDelete} className="text-xs text-white px-1 rounded" style={{ backgroundColor: '#E24B4A' }}>Del</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} aria-label="Remove photo"
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
            style={{ backgroundColor: '#E24B4A' }}>×</button>
        )}
      </div>
      {expanded && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" onClick={() => setExpanded(false)}>
          <button type="button" onClick={() => setExpanded(false)} aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white">
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={attachment.url} alt={attachment.display_name} className="max-w-[90vw] max-h-[85vh] rounded-lg object-contain" />
        </div>
      )}
    </>
  );
}
