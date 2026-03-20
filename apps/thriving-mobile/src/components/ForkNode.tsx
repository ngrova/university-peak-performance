// ═══════════════════════════════════════════════════════════
// FILE: ForkNode.tsx
// PURPOSE: A fork point in the task chain — appears when a task
//   has multiple children (parallel tracks). Shows "N parallel
//   tracks" with a description. Tapping drills into ForkDetail.
// CALLED BY: components/TaskChain.tsx
// DATA FLOW: TaskChain detects a fork in the chain → renders this
//   → user taps → onTap drills into the fork's track list
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { GitBranch } from 'lucide-react';

interface ForkNodeProps {
  trackCount: number;
  color: string;
  onTap: () => void;
}

/**
 * Triggered by: TaskChain encounters a fork ChainNode in the array.
 * Steps: renders a tappable node showing the number of parallel
 *   tracks with a branch icon. Tapping opens ForkDetail.
 * Returns: a styled fork indicator node.
 */
export default function ForkNode({ trackCount, color, onTap }: ForkNodeProps): React.JSX.Element {
  return (
    <button type="button" onClick={onTap} aria-label={`Fork: ${trackCount} parallel tracks`}
      className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-left"
      style={{ backgroundColor: 'var(--bg-surface)', border: `1px dashed ${color}`, minHeight: '44px' }}>
      <GitBranch size={18} style={{ color, flexShrink: 0 }} />
      <p className="text-sm font-medium" style={{ color }}>
        {trackCount} parallel tracks
      </p>
    </button>
  );
}
