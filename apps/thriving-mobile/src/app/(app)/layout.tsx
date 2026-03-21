// ═══════════════════════════════════════════════════════════
// FILE: layout.tsx (app shell)
// PURPOSE: The authenticated app shell — wraps every screen with
//   the delegation banner (if acting as assistant), the bottom tab
//   bar, the capture sheet, and the task detail sheet.
// CALLED BY: Next.js framework (automatic — layout for the (app) group)
// DATA FLOW: DelegationBanner reads acting_as cookie → child page
//   renders inside <main> → BottomTabBar, CaptureSheet, and
//   TaskDetailSheet mount alongside, controlled by Zustand stores
// ═══════════════════════════════════════════════════════════
import React from 'react';
import BottomTabBar from '@/components/BottomTabBar';
import CaptureSheet from '@/components/CaptureSheet';
import TaskDetailSheet from '@/components/TaskDetailSheet';
import DelegationBanner from '@/components/DelegationBanner';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Triggered by: Next.js renders this for all routes under /(app)/.
 * Steps: renders DelegationBanner (only visible if acting as assistant),
 *   then the child page in a padded <main> area, then mounts the three
 *   persistent overlays (tab bar, capture sheet, detail sheet) below.
 * Returns: the app shell layout wrapping the current page.
 */
export default function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <DelegationBanner />
      <main
        className="px-5"
        style={{
          paddingTop: 'env(safe-area-inset-top, 20px)',
          paddingBottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom) + 16px)',
        }}
      >
        {children}
      </main>
      <BottomTabBar />
      <CaptureSheet />
      <TaskDetailSheet />
    </div>
  );
}
