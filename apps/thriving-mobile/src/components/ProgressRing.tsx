// ═══════════════════════════════════════════════════════════
// FILE: ProgressRing.tsx
// PURPOSE: A circular SVG progress ring used on tree nodes to
//   show task completion. The filled arc uses the pillar's color.
//   Appears on pillar and goal nodes in the Domino Tree.
// CALLED BY: components/PillarMap.tsx, components/GoalClusters.tsx,
//   components/VertexNode.tsx
// DATA FLOW: Parent passes completed/total counts + color →
//   this computes the arc and renders an SVG circle
// ═══════════════════════════════════════════════════════════
import React from 'react';

interface ProgressRingProps {
  completed: number;
  total: number;
  color: string;
  size?: number;
}

/**
 * Triggered by: tree node components render this to show progress.
 * Steps: computes the stroke-dashoffset from (completed / total),
 *   renders two SVG circles — a background track and a filled arc.
 * Returns: a circular progress ring SVG element.
 */
export default function ProgressRing({ completed, total, color, size = 48 }: ProgressRingProps): React.JSX.Element {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? completed / total : 0;
  const offset = circ * (1 - pct);

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={3} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={3} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
