import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transcribeAudio } from './transcribe-audio';

// Mock reportError to prevent stderr writes during tests
vi.mock('./report-error', () => ({ reportError: vi.fn() }));

const FAKE_KEY = 'test-deepgram-key';
const FAKE_BASE64 = Buffer.from('fake-audio').toString('base64');

describe('transcribeAudio', () => {
  beforeEach(() => {
    vi.stubEnv('DEEPGRAM_API_KEY', FAKE_KEY);
    vi.restoreAllMocks();
  });

  it('returns transcript on successful response', async () => {
    const mockResponse = {
      results: { channels: [{ alternatives: [{ transcript: 'Hello world' }] }] },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const result = await transcribeAudio(FAKE_BASE64, 'audio/webm');
    expect(result).toEqual({ transcript: 'Hello world' });
  });

  it('returns error on HTTP 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad request'),
    }));

    const result = await transcribeAudio(FAKE_BASE64, 'audio/webm');
    expect(result.error).toContain('Transcription failed');
  });

  it('returns error on HTTP 401 (bad key)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    }));

    const result = await transcribeAudio(FAKE_BASE64, 'audio/webm');
    expect(result.error).toContain('Transcription failed');
  });

  it('returns error when transcript is empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: { channels: [{ alternatives: [{ transcript: '' }] }] } }),
    }));

    const result = await transcribeAudio(FAKE_BASE64, 'audio/webm');
    expect(result.error).toContain('empty');
  });

  it('returns error on malformed response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ unexpected: 'shape' }),
    }));

    const result = await transcribeAudio(FAKE_BASE64, 'audio/webm');
    expect(result.error).toContain('empty');
  });

  it('returns timeout error when fetch exceeds 15s', async () => {
    const timeoutErr = new DOMException('Signal timed out', 'TimeoutError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeoutErr));

    const result = await transcribeAudio(FAKE_BASE64, 'audio/webm');
    expect(result.error).toContain('timed out');
  });

  it('returns error when DEEPGRAM_API_KEY is not set', async () => {
    vi.stubEnv('DEEPGRAM_API_KEY', '');

    const result = await transcribeAudio(FAKE_BASE64, 'audio/webm');
    expect(result.error).toContain('not configured');
  });
});
