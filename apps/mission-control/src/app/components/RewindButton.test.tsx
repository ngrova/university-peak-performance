import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewindButton } from './RewindButton';

describe('RewindButton', () => {
  it('shows REWIND when idle', () => {
    render(<RewindButton status="idle" onRewind={vi.fn()} onHardRewind={vi.fn()} />);
    expect(screen.getByRole('button', { name: /⟲ Rewind/i })).toBeInTheDocument();
  });

  it('shows Hard Rewind secondary button', () => {
    render(<RewindButton status="idle" onRewind={vi.fn()} onHardRewind={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Hard Rewind/i })).toBeInTheDocument();
  });

  it('disables main button and shows in progress when not idle', () => {
    render(<RewindButton status="awaiting-agent" onRewind={vi.fn()} onHardRewind={vi.fn()} />);
    expect(screen.getByText(/Rewind in progress/i)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Rewind in progress/i });
    expect(btn).toBeDisabled();
  });

  it('calls onRewind when REWIND clicked', async () => {
    const onRewind = vi.fn();
    render(<RewindButton status="idle" onRewind={onRewind} onHardRewind={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /⟲ Rewind/i }));
    expect(onRewind).toHaveBeenCalledOnce();
  });

  it('calls onHardRewind when Hard Rewind clicked', async () => {
    const onHardRewind = vi.fn();
    render(<RewindButton status="idle" onRewind={vi.fn()} onHardRewind={onHardRewind} />);
    await userEvent.click(screen.getByRole('button', { name: /Hard Rewind/i }));
    expect(onHardRewind).toHaveBeenCalledOnce();
  });

  it('re-enables main button when done', () => {
    render(<RewindButton status="done" onRewind={vi.fn()} onHardRewind={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /⟲ Rewind/i });
    expect(btn).not.toBeDisabled();
  });

  it('hard rewind button is always enabled', () => {
    render(<RewindButton status="running" onRewind={vi.fn()} onHardRewind={vi.fn()} />);
    const hardBtn = screen.getByRole('button', { name: /Hard Rewind/i });
    expect(hardBtn).not.toBeDisabled();
  });
});
