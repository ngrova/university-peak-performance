// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (goals)
// PURPOSE: Placeholder for the Goals screen — will show life
//   pillars and their linked goals in Phase 3. Currently just
//   displays a "coming soon" message.
// CALLED BY: Next.js framework (automatic — this is the /goals route)
// DATA FLOW: No data flow yet — static placeholder content only
// ═══════════════════════════════════════════════════════════
import React from 'react';

/**
 * Triggered by: user navigates to the Goals tab.
 * Steps: renders a static heading and "coming in Phase 3" message.
 * Returns: the placeholder Goals screen.
 */
export default function GoalsPage(): React.JSX.Element {
  return (
    <div className="pt-4 tab-enter">
      <h1
        className="text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        Goals
      </h1>
      <p
        className="mt-2 text-base"
        style={{ color: 'var(--text-secondary)' }}
      >
        Life Pillars and Goals — coming in Phase 3.
      </p>
    </div>
  );
}
