import React from 'react';

/** Placeholder for the Tree screen — domino tree with zone navigation */
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
