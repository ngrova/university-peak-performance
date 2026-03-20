// ═══════════════════════════════════════════════════════════
// FILE: BreadcrumbChip.tsx
// PURPOSE: A single breadcrumb item — either a tappable link
//   (for parent levels) or a static label (for the current level).
//   Used inside the Breadcrumbs component.
// CALLED BY: components/Breadcrumbs.tsx
// DATA FLOW: Breadcrumbs passes item data + isLast flag → this
//   renders a button (if tappable) or span (if current level)
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItem } from '@/hooks/use-goals-drilldown';

interface BreadcrumbChipProps {
  item: BreadcrumbItem;
  isLast: boolean;
  showSeparator: boolean;
  onNavigate: (level: 'pillars' | 'pillar') => void;
}

/**
 * Triggered by: Breadcrumbs maps each item to one of these.
 * Steps: if showSeparator, renders a chevron. Then renders the
 *   item as a tappable button (non-last) or static text (last).
 * Returns: a breadcrumb chip fragment.
 */
export default function BreadcrumbChip({ item, isLast, showSeparator, onNavigate }: BreadcrumbChipProps): React.JSX.Element {
  return (
    <>
      {showSeparator && <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
      {isLast ? (
        <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {item.label}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onNavigate(item.level as 'pillars' | 'pillar')}
          className="text-xs truncate"
          style={{ color: 'var(--accent)', minHeight: '32px' }}
        >
          {item.label}
        </button>
      )}
    </>
  );
}
