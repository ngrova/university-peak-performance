import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopStrip } from './TopStrip';
import type { TopStripProps } from './TopStrip';

const IDLE_REWIND = {
  status: 'idle' as const,
  agentMessage: null,
  requestedAt: null,
  confirmedAt: null,
  stages: { memory: 'idle' as const, clear: 'idle' as const, restart: 'idle' as const, verify: 'idle' as const },
};

const baseSession = {
  tokens: 50_000,
  cap: 200_000,
  percent: 25,
  outputTokens: 1000,
  messageCount: 10,
  systemTokens: 10_000,
  convoTokens: 40_000,
  rewindSavings: 20_000,
  rewindSavingsPct: 10,
};

const baseSpend = { usage: 80, usageToday: 30 };

function renderStrip(overrides: Partial<TopStripProps> = {}) {
  const props: TopStripProps = {
    session: baseSession,
    spend: baseSpend,
    rewindState: IDLE_REWIND,
    onRewind: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  return render(<TopStrip {...props} />);
}

describe('TopStrip', () => {
  it('renders title and subtitle', () => {
    renderStrip();
    expect(screen.getByText("ALBUS'S LOOKOUT")).toBeInTheDocument();
    expect(screen.getByText('Nick Grover HQ — Token Command')).toBeInTheDocument();
  });

  it('shows REWIND button when rewind state is idle', () => {
    renderStrip();
    expect(screen.getByRole('button', { name: /rewind/i })).toBeInTheDocument();
  });

  it('shows CANCEL button when rewind is running', () => {
    renderStrip({
      rewindState: {
        ...IDLE_REWIND,
        status: 'running',
        stages: { memory: 'running', clear: 'idle', restart: 'idle', verify: 'idle' },
      },
    });
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onRewind when REWIND button is clicked', () => {
    const onRewind = vi.fn();
    renderStrip({ onRewind });
    fireEvent.click(screen.getByRole('button', { name: /rewind/i }));
    expect(onRewind).toHaveBeenCalledOnce();
  });

  it('calls onCancel when CANCEL button is clicked during running rewind', () => {
    const onCancel = vi.fn();
    renderStrip({
      onCancel,
      rewindState: {
        ...IDLE_REWIND,
        status: 'running',
        stages: { memory: 'running', clear: 'idle', restart: 'idle', verify: 'idle' },
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows context percentage and token counts', () => {
    renderStrip();
    expect(screen.getByText('25%')).toBeInTheDocument();
    // usedK = 50, capK = 200
    expect(screen.getByText('50K / 200K')).toBeInTheDocument();
  });

  it('shows rewind savings when savingsK > 2', () => {
    // rewindSavingsPct=10, cap=200_000 → savingsK = 20
    renderStrip();
    expect(screen.getByText('rewind saves ~20K')).toBeInTheDocument();
  });

  it('hides rewind savings when savingsK <= 2', () => {
    renderStrip({ session: { ...baseSession, rewindSavingsPct: 1, cap: 200_000 } });
    // savingsK = 1 * 200_000 / 100 / 1000 = 2, not > 2
    expect(screen.queryByText(/rewind saves/)).not.toBeInTheDocument();
  });

  it('shows CREDITS and DAILY $ labels', () => {
    renderStrip();
    expect(screen.getByText('CREDITS')).toBeInTheDocument();
    expect(screen.getByText('DAILY $')).toBeInTheDocument();
  });

  it('shows pulsing dot when daily spend exceeds cap', () => {
    const { container } = renderStrip({
      spend: { usage: 80, usageToday: 120 },
    });
    // Pulse animation style will be present on an element
    const pulsers = container.querySelectorAll('[style*="pulse-dot"]');
    expect(pulsers.length).toBeGreaterThan(0);
  });

  it('displays correct credits remaining', () => {
    // usage=80 → remaining = 200-80 = 120
    renderStrip({ spend: { usage: 80, usageToday: 30 } });
    expect(screen.getByText('$120')).toBeInTheDocument();
  });
});
