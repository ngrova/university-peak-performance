import React from 'react';

/** Placeholder for the Capture screen — will become a bottom sheet in Phase 1 */
export default function CapturePage(): React.JSX.Element {
  return (
    <div className="pt-4 tab-enter">
      <h1
        className="text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        Capture
      </h1>
      <p
        className="mt-2 text-base"
        style={{ color: 'var(--text-secondary)' }}
      >
        Quick-add — coming in Phase 1.
      </p>
    </div>
  );
}
