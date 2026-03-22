// ═══════════════════════════════════════════════════════════
// FILE: GoalColorPicker.tsx
// PURPOSE: A row of color swatches for picking an accent color.
//   Tapping a swatch immediately saves the new color.
// CALLED BY: components/GoalEditSheet.tsx, components/PillarEditSheet.tsx
// DATA FLOW: Parent sheet passes current color + onSave callback →
//   user taps a swatch → onSave fires with the hex value
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { Check } from 'lucide-react';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
];

interface GoalColorPickerProps {
  value: string;
  onSave: (color: string) => void;
}

/**
 * Triggered by: GoalEditSheet renders this in the edit form.
 * Steps: renders a horizontal row of color circles. The active
 *   color shows a checkmark. Tapping a different color calls
 *   onSave with the new hex value, triggering an auto-save.
 * Returns: a row of tappable color swatches.
 */
export default function GoalColorPicker({ value, onSave }: GoalColorPickerProps): React.JSX.Element {
  return (
    <div className="mb-3">
      <label className="text-xs block mb-2" style={{ color: 'var(--text-muted)' }}>Color</label>
      <div className="flex gap-2 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onSave(c)}
            aria-label={`Color ${c}`}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: c, minHeight: '44px', minWidth: '44px' }}
          >
            {value === c && <Check size={16} color="#fff" />}
          </button>
        ))}
      </div>
    </div>
  );
}
