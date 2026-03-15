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

  // CODING/IDLE badge is now rendered in AlbusSprite, not ActivityStrip.
  // ActivityStrip still receives albusState as a prop for future use.
  it('accepts albusState prop without error (idle)', () => {
    expect(() => render(<ActivityStrip entries={[]} albusState="idle" />)).not.toThrow();
  });

  it('accepts albusState prop without error (coding)', () => {
    expect(() => render(<ActivityStrip entries={[makeEntry()]} albusState="coding" />)).not.toThrow();
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

  it('shows up to 10 most recent entries in a single column', () => {
    const entries = Array.from({ length: 12 }, (_, i) =>
      makeEntry({ id: `e${i}`, action: `action ${i}`, timestamp: Date.now() - i * 1000 })
    );
    render(<ActivityStrip entries={entries} albusState="idle" />);
    expect(screen.getByText('action 0')).toBeInTheDocument();
    expect(screen.getByText('action 9')).toBeInTheDocument();
    expect(screen.queryByText('action 10')).not.toBeInTheDocument();
  });

  it('renders entries in a single vertical column (flex column)', () => {
    const entries = [makeEntry({ id: 'a', action: 'alpha' }), makeEntry({ id: 'b', action: 'beta' })];
    const { container } = render(<ActivityStrip entries={entries} albusState="idle" />);
    const col = container.querySelector('[style*="flex-direction: column"]');
    expect(col).toBeTruthy();
  });
});
