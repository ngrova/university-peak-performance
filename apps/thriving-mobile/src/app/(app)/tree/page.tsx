// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (tree)
// PURPOSE: Placeholder for the Tree screen — will show the
//   domino tree visualization in Phase 4. Currently just
//   displays a "coming soon" message.
// CALLED BY: Next.js framework (automatic — this is the /tree route)
// DATA FLOW: No data flow yet — static placeholder content only
// ═══════════════════════════════════════════════════════════
import React from 'react';

/**
 * Triggered by: user navigates to the Tree tab.
 * Steps: renders a static heading and "coming in Phase 4" message.
 * Returns: the placeholder Tree screen.
 */
export default function TreePage(): React.JSX.Element {
  return (
    <div className="pt-4 tab-enter">
      <h1
        className="text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        Tree
      </h1>
      <p
        className="mt-2 text-base"
        style={{ color: 'var(--text-secondary)' }}
      >
        Domino Tree — coming in Phase 4.
      </p>
    </div>
  );
}
