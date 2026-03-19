import React from 'react';

/** Displays "Good morning/afternoon/evening, Nick" with today's date */
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
