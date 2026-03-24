// ═══════════════════════════════════════════════════════════
// FILE: providers.tsx
// PURPOSE: Sets up TanStack Query and global UI overlays (like
//   the PWA update banner) so they're available on every page.
// CALLED BY: app/layout.tsx (root layout wraps children in this)
// DATA FLOW: Creates a QueryClient → wraps the app in its Provider
//   → renders UpdateBanner for PWA updates → children render inside
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UpdateBanner from '@/components/UpdateBanner';

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
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <UpdateBanner />
      {children}
    </QueryClientProvider>
  );
}
