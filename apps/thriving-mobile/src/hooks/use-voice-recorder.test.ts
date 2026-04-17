import { describe, it, expect, vi, afterEach } from 'vitest';
import { getAudioMimeType } from './use-voice-recorder';

describe('getAudioMimeType', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubMediaRecorder(supported: string[]): void {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: (type: string): boolean => supported.includes(type),
    });
  }

  it('returns undefined when MediaRecorder is unavailable (SSR)', () => {
    vi.stubGlobal('MediaRecorder', undefined);
    expect(getAudioMimeType()).toBeUndefined();
  });

  it('prefers webm+opus when available (Chrome/Firefox)', () => {
    stubMediaRecorder(['audio/webm;codecs=opus', 'audio/webm']);
    expect(getAudioMimeType()).toBe('audio/webm;codecs=opus');
  });

  it('falls back to mp4+aac on Safari when webm is unsupported', () => {
    stubMediaRecorder(['audio/mp4;codecs=mp4a.40.2', 'audio/mp4']);
    expect(getAudioMimeType()).toBe('audio/mp4;codecs=mp4a.40.2');
  });

  it('falls back to plain mp4 when mp4+aac is unsupported', () => {
    stubMediaRecorder(['audio/mp4']);
    expect(getAudioMimeType()).toBe('audio/mp4');
  });

  it('falls back to ogg+opus when mp4 is unsupported', () => {
    stubMediaRecorder(['audio/ogg;codecs=opus']);
    expect(getAudioMimeType()).toBe('audio/ogg;codecs=opus');
  });

  it('returns undefined when no known codec is supported (browser picks default)', () => {
    stubMediaRecorder([]);
    expect(getAudioMimeType()).toBeUndefined();
  });
});
