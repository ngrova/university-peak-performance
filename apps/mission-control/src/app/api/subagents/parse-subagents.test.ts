import { describe, it, expect } from 'vitest';
import { parseSubagentsOutput } from './parse-subagents';

const ACTIVE_WINDOW_MS = 5 * 60 * 1000;
const now = Date.now();

function sessions(entries: Array<{ key: string; updatedAt: number }>) {
  return JSON.stringify({ sessions: entries });
}

describe('parseSubagentsOutput', () => {
  it('returns empty when no subagent sessions', () => {
    const raw = sessions([
      { key: 'agent:main:slack:direct:u0alg528dt4', updatedAt: now },
      { key: 'agent:main:main', updatedAt: now },
    ]);
    const result = parseSubagentsOutput(raw, now);
    expect(result.count).toBe(0);
    expect(result.subagents).toHaveLength(0);
  });

  it('marks subagent active when updatedAt is recent', () => {
    const raw = sessions([
      { key: 'agent:main:subagent:079c272a-4473-454e-939e-4b18498d62cd', updatedAt: now - 30_000 },
    ]);
    const result = parseSubagentsOutput(raw, now);
    expect(result.count).toBe(1);
    expect(result.subagents[0]!.active).toBe(true);
    expect(result.subagents[0]!.id).toBe('079c272a');
  });

  it('marks subagent stale when updatedAt > 5 minutes ago', () => {
    const raw = sessions([
      { key: 'agent:main:subagent:stale-0000-uuid', updatedAt: now - ACTIVE_WINDOW_MS - 1000 },
    ]);
    const result = parseSubagentsOutput(raw, now);
    expect(result.count).toBe(0);
    expect(result.subagents[0]!.active).toBe(false);
  });

  it('sorts subagents most-recent first', () => {
    const raw = sessions([
      { key: 'agent:main:subagent:aaaa-older', updatedAt: now - 120_000 },
      { key: 'agent:main:subagent:bbbb-newer', updatedAt: now - 10_000 },
    ]);
    const result = parseSubagentsOutput(raw, now);
    expect(result.count).toBe(2);
    expect(result.subagents[0]!.key).toContain('bbbb-newer');
    expect(result.subagents[1]!.key).toContain('aaaa-older');
  });

  it('handles multiple subagents with mixed active/stale', () => {
    const raw = sessions([
      { key: 'agent:main:subagent:active-111', updatedAt: now - 60_000 },
      { key: 'agent:main:subagent:stale-222', updatedAt: now - ACTIVE_WINDOW_MS - 5000 },
    ]);
    const result = parseSubagentsOutput(raw, now);
    expect(result.count).toBe(1);
    expect(result.subagents).toHaveLength(2);
    expect(result.subagents.find(s => s.key.includes('active-111'))!.active).toBe(true);
    expect(result.subagents.find(s => s.key.includes('stale-222'))!.active).toBe(false);
  });

  it('returns fallback on invalid JSON', () => {
    const result = parseSubagentsOutput('not json', now);
    expect(result.count).toBe(0);
    expect(result.subagents).toHaveLength(0);
  });

  it('returns fallback on empty input', () => {
    const result = parseSubagentsOutput('', now);
    expect(result.count).toBe(0);
    expect(result.subagents).toHaveLength(0);
  });

  it('includes full key in subagent entry', () => {
    const key = 'agent:main:subagent:079c272a-4473-454e-939e-4b18498d62cd';
    const raw = sessions([{ key, updatedAt: now }]);
    const result = parseSubagentsOutput(raw, now);
    expect(result.subagents[0]!.key).toBe(key);
  });
});
