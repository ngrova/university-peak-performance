import React from 'react';

/** Placeholder for the Today screen — daily driver */
export default function TodayPage(): React.JSX.Element {
  return (
    <div className="pt-4 tab-enter">
      <h1
        className="text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        Today
      </h1>
      <p
        className="mt-2 text-base"
        style={{ color: 'var(--text-secondary)' }}
      >
        Your daily driver — coming in Phase 1.
      </p>
    </div>
  );
}
