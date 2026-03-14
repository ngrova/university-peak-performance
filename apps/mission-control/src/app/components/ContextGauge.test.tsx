import { describe, it, expect } from 'vitest';
import { parseSessionOutput } from '../api/session/parse-session';

// Sample from actual `openclaw sessions --json` output observed 2026-03-14
const SAMPLE_OUTPUT = JSON.stringify({
  path: '/Users/openclaw/.openclaw/agents/main/sessions/sessions.json',
  count: 3,
  activeMinutes: null,
  sessions: [
    {
      key: 'agent:main:subagent:abc',
      updatedAt: 1773505770969,
      ageMs: 6803,
      totalTokens: null,
      totalTokensFresh: false,
      model: 'anthropic/claude-sonnet-4.6',
      contextTokens: 200000,
    },
    {
      key: 'agent:main:slack:direct:u0alg528dt4',
      updatedAt: 1773505680405,
      ageMs: 97367,
      inputTokens: 32072,
      outputTokens: 318,
      totalTokens: 16654,
      totalTokensFresh: true,
      model: 'anthropic/claude-sonnet-4.6',
      contextTokens: 200000,
    },
  ],
});

describe('parseSessionOutput', () => {
  it('returns tokens from most recent fresh session', () => {
    const result = parseSessionOutput(SAMPLE_OUTPUT);
    expect(result.tokens).toBe(16654);
    expect(result.cap).toBe(200_000);
    expect(result.percent).toBe(8);
  });

  it('returns zeros for invalid JSON', () => {
    const result = parseSessionOutput('not json');
    expect(result).toEqual({ tokens: 0, cap: 200_000, percent: 0 });
  });

  it('returns zeros when no fresh sessions', () => {
    const nofresh = JSON.stringify({
      sessions: [{ totalTokens: 5000, totalTokensFresh: false }],
    });
    const result = parseSessionOutput(nofresh);
    expect(result.tokens).toBe(0);
  });

  it('caps percent at 100 for over-limit tokens', () => {
    const over = JSON.stringify({
      sessions: [{ totalTokens: 999_999, totalTokensFresh: true, updatedAt: 1 }],
    });
    const result = parseSessionOutput(over);
    expect(result.percent).toBe(100);
  });

  it('handles empty sessions array', () => {
    const empty = JSON.stringify({ sessions: [] });
    expect(parseSessionOutput(empty)).toEqual({ tokens: 0, cap: 200_000, percent: 0 });
  });
});
