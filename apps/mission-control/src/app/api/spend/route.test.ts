import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock env
vi.stubEnv('OPENROUTER_API_KEY', 'sk-or-test-key');

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after stubs are set
const { GET } = await import('./route');

function makeOrResponse(usage: number, usageDaily: number) {
  return { ok: true, json: async () => ({ data: { usage, usage_daily: usageDaily } }) };
}

beforeEach(() => { mockFetch.mockReset(); });
afterEach(() => { vi.clearAllMocks(); });

describe('GET /api/spend', () => {
  it('returns usage and usageToday from OpenRouter', async () => {
    mockFetch.mockResolvedValueOnce(makeOrResponse(60.96, 0.45));
    const res = await GET();
    const json = await res.json() as { usage: number; usageToday: number };
    expect(json.usage).toBe(60.96);
    expect(json.usageToday).toBe(0.45);
  });

  it('returns fallback zeros when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));
    const res = await GET();
    const json = await res.json() as { usage: number; usageToday: number };
    expect(json.usage).toBe(0);
    expect(json.usageToday).toBe(0);
  });

  it('returns fallback when OpenRouter returns non-ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const res = await GET();
    const json = await res.json() as { usage: number; usageToday: number };
    expect(json.usage).toBe(0);
    expect(json.usageToday).toBe(0);
  });

  it('calls the correct OpenRouter endpoint', async () => {
    mockFetch.mockResolvedValueOnce(makeOrResponse(10, 2));
    await GET();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/auth/key',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer sk-or-test-key' }) })
    );
  });
});
