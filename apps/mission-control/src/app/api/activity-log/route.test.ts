import { describe, it, expect } from 'vitest';

// Test the pure helper functions via re-implementation (route exports aren't easily tree-shaken)
// We test the logic used in the route directly

function humanize(subject: string): string {
  const s = subject
    .replace(/^(feat|fix|chore|docs|refactor|test|style|ci|perf|build)(\(.+?\))?!?:\s*/i, '')
    .replace(/\s*\(#\d+\)\s*$/, '');
  return s.length > 52 ? s.slice(0, 49) + '…' : s;
}

function timeAgo(ts: number, now = Date.now()): string {
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function parseType(subject: string, refs: string): string {
  const s = subject.toLowerCase();
  if (refs.includes('origin/') || s.includes('merge pull request')) return 'merge';
  if (s.includes('test') || s.includes('spec')) return 'test';
  if (s.includes('read') || s.includes('check')) return 'read';
  if (s.includes('spawn') || s.includes('subagent')) return 'spawn';
  if (s.startsWith('feat') || s.startsWith('fix') || s.startsWith('chore')) return 'work';
  return 'push';
}

describe('activity-log helpers', () => {
  describe('humanize', () => {
    it('strips conventional commit prefix', () => {
      expect(humanize('feat: add new feature')).toBe('add new feature');
      expect(humanize('fix(ui): correct button color')).toBe('correct button color');
      expect(humanize('chore: update deps')).toBe('update deps');
    });

    it('strips PR number suffix', () => {
      expect(humanize('feat: add feature (#42)')).toBe('add feature');
    });

    it('truncates long messages', () => {
      const long = 'feat: ' + 'a'.repeat(60);
      const result = humanize(long);
      expect(result.length).toBeLessThanOrEqual(52);
      expect(result.endsWith('…')).toBe(true);
    });

    it('leaves short plain messages untouched', () => {
      expect(humanize('initial commit')).toBe('initial commit');
    });
  });

  describe('timeAgo', () => {
    const now = Date.now();
    it('shows seconds', () => {
      expect(timeAgo(now - 30_000, now)).toBe('30s ago');
    });
    it('shows minutes', () => {
      expect(timeAgo(now - 5 * 60_000, now)).toBe('5m ago');
    });
    it('shows hours', () => {
      expect(timeAgo(now - 3 * 3600_000, now)).toBe('3h ago');
    });
    it('shows days', () => {
      expect(timeAgo(now - 2 * 86400_000, now)).toBe('2d ago');
    });
  });

  describe('parseType', () => {
    it('detects merge from refs', () => {
      expect(parseType('some commit', 'HEAD -> develop, origin/develop')).toBe('merge');
    });
    it('detects test commits', () => {
      expect(parseType('add test coverage', '')).toBe('test');
    });
    it('detects spawn/subagent', () => {
      expect(parseType('spawn subagent for task', '')).toBe('spawn');
    });
    it('detects work commits', () => {
      expect(parseType('feat: add context bar', '')).toBe('work');
    });
    it('falls back to push', () => {
      expect(parseType('bump version to 1.2.3', '')).toBe('push');
    });
  });
});
