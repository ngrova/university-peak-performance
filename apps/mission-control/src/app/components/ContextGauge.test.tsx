import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ContextGauge } from './ContextGauge';

interface MockEventSourceInstance {
  onmessage: ((e: MessageEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  close: ReturnType<typeof vi.fn>;
  dispatchMessage: (data: object) => void;
  dispatchError: () => void;
}

let mockInstance: MockEventSourceInstance;

const MockEventSource = vi.fn(() => {
  mockInstance = {
    onmessage: null,
    onerror: null,
    close: vi.fn(),
    dispatchMessage(data: object) {
      this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
    },
    dispatchError() {
      this.onerror?.({} as Event);
    },
  };
  return mockInstance;
});

beforeEach(() => {
  vi.stubGlobal('EventSource', MockEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('ContextGauge', () => {
  it('renders with default zero state', () => {
    render(<ContextGauge />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('opens SSE connection on mount', () => {
    render(<ContextGauge />);
    expect(MockEventSource).toHaveBeenCalledWith('/api/session/stream');
  });

  it('updates display when SSE message received', async () => {
    render(<ContextGauge />);
    await act(async () => {
      mockInstance.dispatchMessage({ tokens: 32000, cap: 200000, percent: 16 });
    });
    expect(screen.getByText('32.0k')).toBeInTheDocument();
    expect(screen.getByText('16%')).toBeInTheDocument();
  });

  it('shows error state on SSE error', async () => {
    render(<ContextGauge />);
    await act(async () => {
      mockInstance.dispatchError();
    });
    expect(screen.getByText('Could not fetch session data')).toBeInTheDocument();
  });

  it('closes SSE connection on unmount', () => {
    const { unmount } = render(<ContextGauge />);
    unmount();
    expect(mockInstance.close).toHaveBeenCalled();
  });

  it('clears error when valid message received after error', async () => {
    render(<ContextGauge />);
    await act(async () => {
      mockInstance.dispatchError();
    });
    expect(screen.getByText('Could not fetch session data')).toBeInTheDocument();
    await act(async () => {
      mockInstance.dispatchMessage({ tokens: 5000, cap: 200000, percent: 3 });
    });
    expect(screen.queryByText('Could not fetch session data')).not.toBeInTheDocument();
  });
});
