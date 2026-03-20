// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (goals)
// PURPOSE: The Goals tab's page — renders GoalsContent which
//   handles the three-level drill-down: pillars → goals → tasks.
// CALLED BY: Next.js framework (automatic — this is the /goals route)
// DATA FLOW: Next.js renders this → it renders GoalsContent →
//   GoalsContent manages drill-down navigation and data fetching
// ═══════════════════════════════════════════════════════════
import React from 'react';
import GoalsContent from '@/components/GoalsContent';

/**
 * Triggered by: user navigates to the Goals tab.
 * Steps: renders the GoalsContent component which handles all
 *   drill-down navigation, data fetching, and display.
 * Returns: the Goals screen UI.
 */
export default function GoalsPage(): React.JSX.Element {
  return <GoalsContent />;
}
