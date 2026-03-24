// ═══════════════════════════════════════════════════════════
// FILE: use-sw-update.ts
// PURPOSE: Registers the service worker and detects when a new
//   version is waiting to activate. Returns the waiting SW so
//   the UI can prompt the user to update.
// CALLED BY: components/UpdateBanner.tsx
// DATA FLOW: Browser registers /sw.js → on update, SW enters
//   "waiting" state → hook exposes it → banner shows Update button
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';

/**
 * Triggered by: UpdateBanner mounts (renders on every page via providers).
 * Steps: registers /sw.js on mount. If an update is found (new SW
 *   waiting), stores the waiting ServiceWorker ref. Also listens for
 *   controllerchange to reload the page when the new SW activates.
 * Returns: the waiting SW ref, or null if no update is pending.
 */
export function useSwUpdate(): ServiceWorker | null {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    let reg: ServiceWorkerRegistration | undefined;

    // Reload when a new SW takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());

    // Register and listen for updates
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        reg = registration;
        // Check if an update is already waiting
        if (registration.waiting) { setWaiting(registration.waiting); return; }
        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newSw = registration.installing;
          if (!newSw) return;
          newSw.addEventListener('statechange', () => {
            if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
              setWaiting(newSw);
            }
          });
        });
      })
      .catch(() => { /* SW registration failed (e.g., HTTP in dev) — ignore */ });

    // Check for updates every 5 minutes
    const interval = setInterval(() => { reg?.update().catch(() => {}); }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return waiting;
}
