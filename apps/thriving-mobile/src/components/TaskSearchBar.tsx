'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface TaskSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/** Sticky search input for filtering tasks by title */
export default function TaskSearchBar({ value, onChange }: TaskSearchBarProps): React.JSX.Element {
  return (
    <div className="relative mb-3">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--text-muted)' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tasks..."
        aria-label="Search tasks"
        className="w-full rounded-lg pl-9 pr-4 text-sm"
        style={{
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          height: '40px',
        }}
      />
    </div>
  );
}
