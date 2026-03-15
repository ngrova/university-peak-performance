import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityStrip } from './ActivityStrip';
import type { LogEntry } from '../api/activity-log/route';

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: 'abc123',
    ago: '5m ago',
    action: 'chore: update deps',
    type: 'work',
    timestamp: Date.now() - 300_000,
    ...overrides,
  };
}

describe('ActivityStrip', () => {
  it('renders header and ACTIVITY LOG label', () => {
    render(<ActivityStrip entries={[]} albusState="idle" />);
    expect(screen.getByText('ACTIVITY LOG')).toBeInTheDocument();
  });

  it('shows IDLE badge when albusState is idle', () => {
    render(<ActivityStrip entries={[]} albusState="idle" />);
    expect(screen.getByText('IDLE')).toBeInTheDocument();
  });

  it('shows CODING badge when albusState is coding', () => {
    render(<ActivityStrip entries={[makeEntry()]} albusState="coding" />);
    expect(screen.getByText('CODING')).toBeInTheDocument();
  });

  it('renders entry action text', () => {
    const entry = makeEntry({ action: 'fix: resolve login bug', type: 'work' });
    render(<ActivityStrip entries={[entry]} albusState="idle" />);
    expect(screen.getByText('fix: resolve login bug')).toBeInTheDocument();
  });

  it('shows "no activity yet" when entries is empty', () => {
    render(<ActivityStrip entries={[]} albusState="idle" />);
    expect(screen.getByText('no activity yet')).toBeInTheDocument();
  });

  it('only shows the 6 most recent entries', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry({ id: `e${i}`, action: `action ${i}`, timestamp: Date.now() - i * 1000 })
    );
    render(<ActivityStrip entries={entries} albusState="idle" />);
    // Only first 6 of the provided array should be shown
    expect(screen.getByText('action 0')).toBeInTheDocument();
    expect(screen.getByText('action 5')).toBeInTheDocument();
    expect(screen.queryByText('action 6')).not.toBeInTheDocument();
  });

  it('renders 2 columns (grid)', () => {
    const entries = [makeEntry({ id: 'a', action: 'alpha' }), makeEntry({ id: 'b', action: 'beta' })];
    const { container } = render(<ActivityStrip entries={entries} albusState="idle" />);
    const grid = container.querySelector('[style*="grid-template-columns"]');
    expect(grid).toBeTruthy();
  });
});
