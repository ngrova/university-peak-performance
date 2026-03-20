// ═══════════════════════════════════════════════════════════
// FILE: GreetingBar.tsx
// PURPOSE: Shows a personalized greeting ("Good morning") and
//   today's date at the top of the Today screen.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: No external data — reads the device clock to pick
//   morning/afternoon/evening and format the date string
// ═══════════════════════════════════════════════════════════
import React from 'react';

/**
 * Triggered by: TodayContent renders this at the top of the screen.
 * Steps: reads the current hour from the device clock, picks
 *   "morning", "afternoon", or "evening", and formats today's
 *   date as "Wednesday, March 20".
 * Returns: a header row with the greeting and date.
 */
export default function GreetingBar(): React.JSX.Element {
  const hour = new Date().getHours();
  const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex items-baseline justify-between pt-2 pb-4">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Good {period}
      </h1>
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {dateStr}
      </span>
    </div>
  );
}
