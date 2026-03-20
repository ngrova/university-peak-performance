// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (tree)
// PURPOSE: The Tree tab's page — renders TreeContent which
//   handles the Domino Tree's zone-based drill-down navigation.
// CALLED BY: Next.js framework (automatic — this is the /tree route)
// DATA FLOW: Next.js renders this → it renders TreeContent →
//   TreeContent manages drill-down navigation and data display
// ═══════════════════════════════════════════════════════════
import React from 'react';
import TreeContent from '@/components/TreeContent';

/**
 * Triggered by: user navigates to the Tree tab.
 * Steps: renders the TreeContent component which handles all
 *   drill-down navigation, data fetching, and tree display.
 * Returns: the Tree screen UI.
 */
export default function TreePage(): React.JSX.Element {
  return <TreeContent />;
}
