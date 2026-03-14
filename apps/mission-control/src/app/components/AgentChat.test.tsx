import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentChat } from './AgentChat';
import type { RewindStateFile } from '../api/rewind/rewind-state-file';

const BASE_STATE: RewindStateFile = {
  status: 'idle',
  agentMessage: null,
  requestedAt: null,
  confirmedAt: null,
  stages: { memory: 'idle', clear: 'idle', restart: 'idle', verify: 'idle' },
};

describe('AgentChat', () => {
  it('renders nothing when status is idle', () => {
    const { container } = render(
      <AgentChat state={BASE_STATE} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders spinner when awaiting-agent', () => {
    const state = { ...BASE_STATE, status: 'awaiting-agent' as const };
    render(<AgentChat state={state} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Waiting for Albus...')).toBeInTheDocument();
  });

  it('renders agent message and confirm/cancel buttons when awaiting-confirm', () => {
    const state = { ...BASE_STATE, status: 'awaiting-confirm' as const, agentMessage: 'Hey Nick, ready to rewind?' };
    render(<AgentChat state={state} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Hey Nick, ready to rewind?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CONFIRM' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CANCEL' })).toBeInTheDocument();
  });

  it('calls onConfirm when CONFIRM is clicked', async () => {
    const onConfirm = vi.fn();
    const state = { ...BASE_STATE, status: 'awaiting-confirm' as const, agentMessage: 'Ready?' };
    render(<AgentChat state={state} onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'CONFIRM' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when CANCEL is clicked', async () => {
    const onCancel = vi.fn();
    const state = { ...BASE_STATE, status: 'awaiting-confirm' as const, agentMessage: 'Ready?' };
    render(<AgentChat state={state} onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'CANCEL' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows stage lights when running', () => {
    const state = {
      ...BASE_STATE, status: 'running' as const,
      stages: { ...BASE_STATE.stages, clear: 'running' as const },
    };
    render(<AgentChat state={state} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Restart')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
  });

  it('shows success message when done', () => {
    const state = { ...BASE_STATE, status: 'done' as const };
    render(<AgentChat state={state} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('✓ Session cleared. Fresh start.')).toBeInTheDocument();
  });

  it('shows failure message when failed', () => {
    const state = { ...BASE_STATE, status: 'failed' as const };
    render(<AgentChat state={state} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(/Rewind failed/)).toBeInTheDocument();
  });
});
