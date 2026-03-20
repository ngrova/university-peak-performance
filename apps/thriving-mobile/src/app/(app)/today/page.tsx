// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (today)
// PURPOSE: The Today tab's page — just a thin wrapper that renders
//   TodayContent, which does all the real work. This file exists
//   because Next.js requires a page.tsx for each route.
// CALLED BY: Next.js framework (automatic — this is the /today route)
// DATA FLOW: Next.js renders this → it renders TodayContent →
//   TodayContent fetches and displays today's tasks
// ═══════════════════════════════════════════════════════════
import React from 'react';
import TodayContent from '@/components/TodayContent';

/**
 * Triggered by: user navigates to the Today tab.
 * Steps: renders the TodayContent component which handles all
 *   data fetching and display.
 * Returns: the Today screen UI.
 */
export default function TodayPage(): React.JSX.Element {
  return <TodayContent />;
}
