// ═══════════════════════════════════════════════════════════
// FILE: layout.tsx (fullscreen)
// PURPOSE: Layout for authenticated full-screen pages that hide
//   the tab bar — like the capture page. Shows DelegationBanner
//   but no bottom tabs or persistent sheets.
// CALLED BY: Next.js framework (automatic — layout for (fullscreen) group)
// DATA FLOW: DelegationBanner reads acting_as cookie → child page
//   renders in a full-viewport <main> with no tab bar padding
// ═══════════════════════════════════════════════════════════
import React from 'react';
import DelegationBanner from '@/components/DelegationBanner';

interface FullscreenLayoutProps {
  children: React.ReactNode;
}

/**
 * Triggered by: Next.js renders this for all routes under /(fullscreen)/.
 * Steps: renders DelegationBanner (only visible if acting as assistant),
 *   then the child page in a full-viewport area with no tab bar.
 * Returns: a minimal authenticated layout without navigation chrome.
 */
export default function FullscreenLayout({ children }: FullscreenLayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <DelegationBanner />
      <main className="px-5" style={{ paddingTop: 'env(safe-area-inset-top, 20px)', paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}>
        {children}
      </main>
    </div>
  );
}
