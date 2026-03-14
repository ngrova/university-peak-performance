import { describe, it, expect } from 'vitest';
import { rewindReducer, INITIAL_STATE } from './rewind-state';
import type { RewindAction } from './rewind-state';

describe('rewindReducer', () => {
  it('starts with correct initial state', () => {
    expect(INITIAL_STATE.running).toBe(false);
    expect(INITIAL_STATE.stages.memory).toBe('idle');
    expect(INITIAL_STATE.error).toBeNull();
  });

  it('START sets running and memoryPrompt', () => {
    const next = rewindReducer(INITIAL_STATE, { type: 'START' });
    expect(next.running).toBe(true);
    expect(next.memoryPrompt).toBe(true);
  });

  it('STAGE_RUNNING transitions stage to running', () => {
    const next = rewindReducer(INITIAL_STATE, { type: 'STAGE_RUNNING', stage: 'memory' });
    expect(next.stages.memory).toBe('running');
    expect(next.stages.clear).toBe('idle');
  });

  it('STAGE_DONE transitions stage to done', () => {
    const running = rewindReducer(INITIAL_STATE, { type: 'STAGE_RUNNING', stage: 'clear' });
    const done = rewindReducer(running, { type: 'STAGE_DONE', stage: 'clear' });
    expect(done.stages.clear).toBe('done');
  });

  it('STAGE_FAILED stops sequence and sets error', () => {
    const mid = rewindReducer(INITIAL_STATE, { type: 'STAGE_RUNNING', stage: 'restart' });
    const failed = rewindReducer(mid, { type: 'STAGE_FAILED', stage: 'restart', error: 'launchctl died' });
    expect(failed.stages.restart).toBe('failed');
    expect(failed.running).toBe(false);
    expect(failed.error).toBe('launchctl died');
  });

  it('RESET returns to initial state', () => {
    const mid = rewindReducer(INITIAL_STATE, { type: 'STAGE_DONE', stage: 'verify' });
    const reset = rewindReducer(mid, { type: 'RESET' });
    expect(reset).toEqual(INITIAL_STATE);
  });

  it('full happy-path sequence transitions all stages', () => {
    const actions: RewindAction[] = [
      { type: 'START' },
      { type: 'STAGE_RUNNING', stage: 'memory' },
      { type: 'STAGE_DONE', stage: 'memory' },
      { type: 'STAGE_RUNNING', stage: 'clear' },
      { type: 'STAGE_DONE', stage: 'clear' },
      { type: 'STAGE_RUNNING', stage: 'restart' },
      { type: 'STAGE_DONE', stage: 'restart' },
      { type: 'STAGE_RUNNING', stage: 'verify' },
      { type: 'STAGE_DONE', stage: 'verify' },
    ];
    const final = actions.reduce(rewindReducer, INITIAL_STATE);
    expect(final.stages).toEqual({ memory: 'done', clear: 'done', restart: 'done', verify: 'done' });
  });
});
