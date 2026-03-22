// ═══════════════════════════════════════════════════════════
// FILE: SuccessToast.tsx
// PURPOSE: A brief success message that fades out after 1.5
//   seconds. Shows "Task added" after a successful capture to
//   confirm the save before fields clear for the next entry.
// CALLED BY: components/CapturePageContent.tsx
// DATA FLOW: Parent sets visible=true → toast renders and fades →
//   after 1.5s, onDone fires → parent clears the state
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useEffect } from 'react';

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onDone: () => void;
}

/**
 * Triggered by: CapturePageContent after a successful task capture.
 * Steps: when visible becomes true, renders a green banner with
 *   the message. Starts a 1.5s timer, then calls onDone so the
 *   parent can hide it and clear fields for the next entry.
 * Returns: a toast element when visible, or null.
 */
export default function SuccessToast({ message, visible, onDone }: SuccessToastProps): React.JSX.Element | null {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <div className="rounded-lg px-4 py-3 mb-3 text-sm font-medium text-center animate-fade-in"
      style={{ backgroundColor: 'rgba(93,202,165,0.15)', color: '#5DCAA5' }}>
      {message}
    </div>
  );
}
