// ═══════════════════════════════════════════════════════════
// FILE: providers.tsx
// PURPOSE: Sets up TanStack Query, global UI overlays (PWA update
//   banner), and the app-focus guard that invalidates stale caches
//   when the PWA resumes from the background.
// CALLED BY: app/layout.tsx (root layout wraps children in this)
// DATA FLOW: Creates a QueryClient → wraps the app in its Provider
//   → AppFocusGuard detects resume and invalidates caches →
//   UpdateBanner shows PWA updates → children render inside
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UpdateBanner from '@/components/UpdateBanner';
import { useAppFocus } from '@/hooks/use-app-focus';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Triggered by: root layout renders this around all page content.
 * Steps: creates a single QueryClient (with 60-second stale time)
 *   on first render and wraps children in QueryClientProvider so
 *   data-fetching hooks work everywhere in the app.
 * Returns: the provider wrapper element containing all children.
 */
export function Providers({ children }: ProvidersProps): React.JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: 'always',
            refetchOnReconnect: 'always',
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppFocusGuard />
      <UpdateBanner />
      {children}
    </QueryClientProvider>
  );
}

/** Runs the app-focus hook to invalidate stale caches on PWA resume */
function AppFocusGuard(): null {
  useAppFocus();
  return null;
}
