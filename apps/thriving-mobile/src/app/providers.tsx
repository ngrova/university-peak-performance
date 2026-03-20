// ═══════════════════════════════════════════════════════════
// FILE: providers.tsx
// PURPOSE: Sets up TanStack Query (our data-fetching library)
//   so every component in the app can load and cache server data.
//   This is "plumbing" — users never see it directly.
// CALLED BY: app/layout.tsx (root layout wraps children in this)
// DATA FLOW: Creates a QueryClient → wraps the app in its Provider
//   → all useQuery/useMutation calls throughout the app use this
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
      {children}
    </QueryClientProvider>
  );
}
