// ═══════════════════════════════════════════════════════════
// FILE: UpdateBanner.tsx
// PURPOSE: Shows a small non-modal banner when a new version of
//   the app is available. Tapping "Update" tells the service worker
//   to activate immediately, then reloads the page. Follows the
//   DelegationBanner visual pattern (fixed, small, non-intrusive).
// CALLED BY: app/providers.tsx (rendered on every page)
// DATA FLOW: useSwUpdate detects waiting SW → banner renders →
//   user taps Update → postMessage SKIP_WAITING → SW activates →
//   controllerchange fires → page reloads
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { useSwUpdate } from '@/hooks/use-sw-update';

/**
 * Triggered by: providers.tsx renders this on every page.
 * Steps: calls useSwUpdate to check for a waiting service worker.
 *   If none, renders nothing. If an update is waiting, shows a
 *   small banner with an Update button that activates the new SW.
 * Returns: the update banner element, or null when no update is pending.
 */
export default function UpdateBanner(): React.JSX.Element | null {
  const waitingSw = useSwUpdate();
  if (!waitingSw) return null;

  // Tells the waiting SW to skip waiting and activate
  function handleUpdate() {
    waitingSw?.postMessage({ type: 'SKIP_WAITING' });
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-2 text-xs"
      style={{
        backgroundColor: 'rgba(93, 202, 165, 0.15)',
        color: '#5DCAA5',
        paddingTop: 'env(safe-area-inset-top, 4px)',
      }}
    >
      <span className="font-medium">New version available</span>
      <button type="button" onClick={handleUpdate} className="underline font-semibold" style={{ color: '#5DCAA5' }}>
        Update
      </button>
    </div>
  );
}
