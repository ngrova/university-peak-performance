// ═══════════════════════════════════════════════════════════
// FILE: DeadlineChip.tsx
// PURPOSE: A tappable chip that shows "No deadline" or the
//   selected date. Tapping opens the native date picker. The
//   native input is visually hidden — the chip is the UI.
// CALLED BY: components/CaptureSheet.tsx
// DATA FLOW: CaptureSheet passes value + onChange → user taps
//   chip → native picker opens → onChange fires with date string
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DeadlineChipProps {
  value: string;
  onChange: (date: string) => void;
}

/**
 * Triggered by: CaptureSheet renders this in the capture form.
 * Steps: renders a chip showing the current date (or "No deadline").
 *   Tapping opens the native date picker by forwarding the click
 *   to a hidden date input. Selecting a date fires onChange.
 * Returns: a tappable deadline chip element.
 */
export default function DeadlineChip({ value, onChange }: DeadlineChipProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasDate = !!value;
  const displayDate = hasDate ? formatDate(value) : 'No deadline';

  return (
    <div className="relative mb-3">
      <button
        type="button"
        onClick={() => inputRef.current?.showPicker?.()}
        aria-label="Deadline"
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
        style={{
          backgroundColor: hasDate ? 'var(--accent-muted, #1a2a3a)' : 'var(--bg-input)',
          border: `1px solid ${hasDate ? 'var(--accent-border, #85B7EB44)' : 'var(--border)'}`,
          color: hasDate ? 'var(--accent, #85B7EB)' : 'var(--text-secondary)',
          minHeight: '36px',
        }}
      >
        <Calendar size={14} />
        {displayDate}
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

/** Formats a date string as "Mar 22, 2026" */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
