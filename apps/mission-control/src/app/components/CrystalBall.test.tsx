import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CrystalBall, crystalClass } from './CrystalBall';

// ── crystalClass unit tests ───────────────────────────────────────────────────
describe('crystalClass', () => {
  it('returns crystal-calm at 0%', () => {
    expect(crystalClass(0)).toBe('crystal-calm');
  });
  it('returns crystal-calm at 24%', () => {
    expect(crystalClass(24)).toBe('crystal-calm');
  });
  it('returns crystal-gentle at 25%', () => {
    expect(crystalClass(25)).toBe('crystal-gentle');
  });
  it('returns crystal-gentle at 49%', () => {
    expect(crystalClass(49)).toBe('crystal-gentle');
  });
  it('returns crystal-warm at 50%', () => {
    expect(crystalClass(50)).toBe('crystal-warm');
  });
  it('returns crystal-warm at 74%', () => {
    expect(crystalClass(74)).toBe('crystal-warm');
  });
  it('returns crystal-hot at 75%', () => {
    expect(crystalClass(75)).toBe('crystal-hot');
  });
  it('returns crystal-hot at 89%', () => {
    expect(crystalClass(89)).toBe('crystal-hot');
  });
  it('returns crystal-danger at 90%', () => {
    expect(crystalClass(90)).toBe('crystal-danger');
  });
  it('returns crystal-danger at 100%', () => {
    expect(crystalClass(100)).toBe('crystal-danger');
  });
});

// ── CrystalBall component tests ───────────────────────────────────────────────
interface MockEventSourceInstance {
  onmessage: ((e: MessageEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  close: ReturnType<typeof vi.fn>;
  dispatch: (data: object) => void;
}

let mockESI: MockEventSourceInstance;

const MockES = vi.fn(() => {
  mockESI = {
    onmessage: null, onerror: null, close: vi.fn(),
    dispatch(data: object) { this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent); },
  };
  return mockESI;
});

beforeEach(() => { vi.stubGlobal('EventSource', MockES); });
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe('CrystalBall component', () => {
  it('renders initial 0% state', () => {
    render(<CrystalBall />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('opens SSE on /api/session/stream', () => {
    render(<CrystalBall />);
    expect(MockES).toHaveBeenCalledWith('/api/session/stream');
  });

  it('updates percent display from SSE', async () => {
    render(<CrystalBall />);
    await act(async () => { mockESI.dispatch({ tokens: 50_000, cap: 200_000, percent: 25 }); });
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('closes SSE on unmount', () => {
    const { unmount } = render(<CrystalBall />);
    unmount();
    expect(mockESI.close).toHaveBeenCalled();
  });

  it('calls onPercentChange with updated percent', async () => {
    const cb = vi.fn();
    render(<CrystalBall onPercentChange={cb} />);
    await act(async () => { mockESI.dispatch({ tokens: 150_000, cap: 200_000, percent: 75 }); });
    expect(cb).toHaveBeenCalledWith(75);
  });
});
