import React from 'react';

/** Placeholder for the Tasks screen — full task inventory */
export default function TasksPage(): React.JSX.Element {
  return (
    <div className="pt-4 tab-enter">
      <h1
        className="text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        Tasks
      </h1>
      <p
        className="mt-2 text-base"
        style={{ color: 'var(--text-secondary)' }}
      >
        Full task inventory — coming in Phase 2.
      </p>
    </div>
  );
}
