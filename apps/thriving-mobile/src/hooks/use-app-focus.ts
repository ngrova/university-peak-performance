// ═══════════════════════════════════════════════════════════
// FILE: use-app-focus.ts
// PURPOSE: Detects when the PWA resumes from the background
//   after being inactive. When the app has been hidden for more
//   than 60 seconds, invalidates all TanStack Query caches so
//   every visible query refetches fresh data from Supabase.
//   Fixes stale data on iOS/Android PWA standalone mode where
//   standard focus events are unreliable.
// CALLED BY: app/providers.tsx (AppFocusGuard component)
// DATA FLOW: Browser fires visibilitychange or pageshow →
//   hook checks elapsed time since last hidden → if > 60s,
//   calls queryClient.invalidateQueries() → TanStack Query
//   refetches all mounted queries on next render
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// How long the app must be hidden before we force-invalidate all caches
const STALE_THRESHOLD_MS = 60_000;

/**
 * Triggered by: AppFocusGuard mounts inside providers.tsx.
 * Steps: records a timestamp when the page goes hidden, then
 *   when it becomes visible again checks if enough time has
 *   passed. If the app was hidden for over 60 seconds,
 *   invalidates every TanStack Query cache to force refetches.
 *   Also handles iOS back-forward cache via pageshow event.
 * Returns: nothing — this is a side-effect-only hook.
 */
export function useAppFocus(): void {
  const queryClient = useQueryClient();
  const hiddenAtRef = useRef<number>(0);

  useEffect(() => {
    // Invalidates all queries if the app was hidden long enough
    function handleResume(): void {
      if (hiddenAtRef.current === 0) return;
      const elapsed = Date.now() - hiddenAtRef.current;
      if (elapsed >= STALE_THRESHOLD_MS) {
        queryClient.invalidateQueries();
      }
      hiddenAtRef.current = 0;
    }

    // Tracks when the page goes hidden or becomes visible again
    function handleVisibility(): void {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now();
      } else {
        handleResume();
      }
    }

    // Handles iOS back-forward cache (bfcache) restoration
    function handlePageShow(event: PageTransitionEvent): void {
      if (event.persisted) {
        handleResume();
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [queryClient]);
}
