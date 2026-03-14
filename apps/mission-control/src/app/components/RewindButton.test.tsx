import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewindButton } from './RewindButton';

describe('RewindButton', () => {
  it('shows CONTEXT REWIND label when idle', () => {
    render(<RewindButton status="idle" onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveTextContent(/CONTEXT REWIND/i);
  });

  it('is enabled when idle', () => {
    render(<RewindButton status="idle" onClick={vi.fn()} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('calls onClick when clicked in idle state', async () => {
    const onClick = vi.fn();
    render(<RewindButton status="idle" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when running', () => {
    render(<RewindButton status="running" onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows REWINDING label when running', () => {
    render(<RewindButton status="running" onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveTextContent(/REWINDING/i);
  });

  it('is disabled when awaiting-agent', () => {
    render(<RewindButton status="awaiting-agent" onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows COMPLETE label when done', () => {
    render(<RewindButton status="done" onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveTextContent(/COMPLETE/i);
  });

  it('is re-enabled when done', () => {
    render(<RewindButton status="done" onClick={vi.fn()} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('shows FAILED label and is re-enabled on failure', () => {
    render(<RewindButton status="failed" onClick={vi.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent(/FAILED/i);
    expect(btn).not.toBeDisabled();
  });
});
