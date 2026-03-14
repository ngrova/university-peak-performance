import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

// Mock all child components so Room.test doesn't need sprites/canvas
vi.mock('./CrystalSprite', () => ({ CrystalSprite: () => null }));
vi.mock('./MoneyBagSprite', () => ({ MoneyBagSprite: () => null }));
vi.mock('./AlbusSprite', () => ({ AlbusSprite: () => null }));
vi.mock('./ApprenticeSprites', () => ({ ApprenticeSprites: () => null }));
vi.mock('./RewindFlash', () => ({ RewindFlash: () => null }));
vi.mock('./SpellbookSprite', () => ({ SpellbookSprite: () => null }));
vi.mock('./SpellbookOverlay', () => ({ SpellbookOverlay: () => null }));

// Mock fetch globally
const makeFetch = (rewindStatus: string) =>
  vi.fn((url: string) => {
    if (url === '/api/rewind/state') {
      return Promise.resolve({ json: () => Promise.resolve({ status: rewindStatus, agentMessage: null, requestedAt: null, confirmedAt: null, stages: { memory: 'idle', clear: 'idle', restart: 'idle', verify: 'idle' } }) });
    }
    if (url === '/api/session') {
      return Promise.resolve({ json: () => Promise.resolve({ tokens: 0, cap: 200_000, percent: 0 }) });
    }
    if (url === '/api/spend') {
      return Promise.resolve({ json: () => Promise.resolve({ usage: 0, usageToday: 0 }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  }) as unknown as typeof fetch;

describe('Room — auto-reload on rewind done', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: vi.fn() },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('reloads the page 2 seconds after rewind status becomes done', async () => {
    global.fetch = makeFetch('done');
    const { Room } = await import('./Room');
    await act(async () => { render(<Room />); });
    await act(async () => { await Promise.resolve(); }); // flush fetch microtasks

    expect(window.location.reload).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(2_000); });
    expect(window.location.reload).toHaveBeenCalledOnce();
  });

  it('does not reload when rewind status is idle', async () => {
    vi.resetModules();
    global.fetch = makeFetch('idle');
    const { Room } = await import('./Room');
    await act(async () => { render(<Room />); });
    await act(async () => { await Promise.resolve(); });
    await act(async () => { vi.advanceTimersByTime(5_000); });
    expect(window.location.reload).not.toHaveBeenCalled();
  });
});
