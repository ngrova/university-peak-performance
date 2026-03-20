// ═══════════════════════════════════════════════════════════
// FILE: VertexNode.tsx
// PURPOSE: The circular "vertex" header at the top of each tree
//   level. Shows a label (name or stat) inside a colored ring.
//   This is the one shared visual pattern used at every level
//   of the Domino Tree — pillars, goals, and task chains.
// CALLED BY: components/PillarMap.tsx, components/GoalClusters.tsx,
//   components/TaskChain.tsx
// DATA FLOW: Parent passes label, subtitle, color, and progress
//   → this renders a circle with the info inside + stats below
// ═══════════════════════════════════════════════════════════
import React from 'react';
import ProgressRing from './ProgressRing';

interface VertexNodeProps {
  label: string;
  subtitle?: string;
  color: string;
  completed: number;
  total: number;
}

/**
 * Triggered by: level components render this as the top header.
 * Steps: renders a ProgressRing with the label centered inside,
 *   and an optional subtitle stats line below.
 * Returns: the vertex header element.
 */
export default function VertexNode({ label, subtitle, color, completed, total }: VertexNodeProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative flex items-center justify-center">
        <ProgressRing completed={completed} total={total} color={color} size={72} />
        <span
          className="absolute text-xs font-bold truncate text-center"
          style={{ color: 'var(--text-primary)', maxWidth: '52px' }}
        >
          {label}
        </span>
      </div>
      {subtitle && (
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
