// ═══════════════════════════════════════════════════════════
// FILE: layout.tsx (app shell)
// PURPOSE: The authenticated app shell — wraps every screen with
//   the bottom tab bar, the capture sheet, and the task detail
//   sheet. These three overlays are always available regardless
//   of which tab the user is on.
// CALLED BY: Next.js framework (automatic — layout for the (app) group)
// DATA FLOW: Child page renders inside <main> → BottomTabBar,
//   CaptureSheet, and TaskDetailSheet mount alongside and are
//   controlled by Zustand stores
// ═══════════════════════════════════════════════════════════
import React from 'react';
import BottomTabBar from '@/components/BottomTabBar';
import CaptureSheet from '@/components/CaptureSheet';
import TaskDetailSheet from '@/components/TaskDetailSheet';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Triggered by: Next.js renders this for all routes under /(app)/.
 * Steps: creates a full-height dark container, renders the child page
 *   inside a padded <main> area, then mounts the three persistent
 *   overlays (tab bar, capture sheet, detail sheet) below.
 * Returns: the app shell layout wrapping the current page.
 */
export default function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
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
