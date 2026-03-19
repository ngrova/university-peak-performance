import React from 'react';
import BottomTabBar from '@/components/BottomTabBar';
import CaptureSheet from '@/components/CaptureSheet';
import TaskDetailSheet from '@/components/TaskDetailSheet';

interface AppLayoutProps {
  children: React.ReactNode;
}

/** App shell with bottom tab bar, capture sheet, and task detail sheet */
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
