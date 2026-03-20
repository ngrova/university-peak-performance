// ═══════════════════════════════════════════════════════════
// FILE: Breadcrumbs.tsx
// PURPOSE: Tappable breadcrumb trail at the top of the Goals
//   screen showing the user's position in the drill-down
//   (e.g., "Pillars > Health > Run a marathon"). Tapping any
//   crumb navigates back to that level.
// CALLED BY: components/GoalsContent.tsx, components/TreeContent.tsx
// DATA FLOW: Parent passes breadcrumb items + onNavigate callback
//   → user taps a crumb → onNavigate fires → hook resets
//   drill-down state to that level
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import type { BreadcrumbItem } from '@/types/breadcrumb';
import BreadcrumbChip from './BreadcrumbChip';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (level: string) => void;
}

/**
 * Triggered by: GoalsContent renders this when drill-down is
 *   deeper than the root pillar list.
 * Steps: maps breadcrumb items into a horizontal row of chips.
 *   All items except the last are tappable.
 * Returns: a breadcrumb navigation bar, or null at root level.
 */
export default function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps): React.JSX.Element | null {
  if (items.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 mb-3 overflow-x-auto" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <BreadcrumbChip
          key={item.level + (item.id ?? '')}
          item={item}
          isLast={i === items.length - 1}
          showSeparator={i > 0}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
