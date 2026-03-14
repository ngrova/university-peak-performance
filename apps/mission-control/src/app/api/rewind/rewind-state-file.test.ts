import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

// We need to test the functions in isolation with a temp path.
// Since STATE_PATH is hardcoded, we test behavior via the exported functions directly.
import { readRewindState, writeRewindState, IDLE_STATE } from './rewind-state-file';

const ORIG_PATH = '/Users/openclaw/.openclaw/mission-control/rewind-state.json';

describe('rewind-state-file helpers', () => {
  let tempDir: string;
  let origContent: string | null = null;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rewind-test-'));
    // Preserve original state if file exists
    try { origContent = fs.readFileSync(ORIG_PATH, 'utf-8'); } catch { origContent = null; }
  });

  afterEach(() => {
    // Restore original state
    if (origContent !== null) {
      fs.writeFileSync(ORIG_PATH, origContent);
    }
  });

  it('readRewindState returns IDLE_STATE when file is unreadable', () => {
    // Write invalid JSON to force parse failure
    fs.writeFileSync(ORIG_PATH, 'NOT JSON');
    const state = readRewindState();
    expect(state.status).toBe('idle');
    expect(state.agentMessage).toBeNull();
  });

  it('writeRewindState persists state and readRewindState reads it back', () => {
    const state = {
      ...IDLE_STATE,
      status: 'awaiting-agent' as const,
      requestedAt: 12345,
    };
    writeRewindState(state);
    const read = readRewindState();
    expect(read.status).toBe('awaiting-agent');
    expect(read.requestedAt).toBe(12345);
  });

  it('writeRewindState handles agentMessage field', () => {
    const state = {
      ...IDLE_STATE,
      status: 'awaiting-confirm' as const,
      agentMessage: 'Test message',
    };
    writeRewindState(state);
    const read = readRewindState();
    expect(read.agentMessage).toBe('Test message');
    expect(read.status).toBe('awaiting-confirm');
  });

  it('IDLE_STATE has expected shape', () => {
    expect(IDLE_STATE.status).toBe('idle');
    expect(IDLE_STATE.agentMessage).toBeNull();
    expect(IDLE_STATE.stages.clear).toBe('idle');
    expect(IDLE_STATE.stages.restart).toBe('idle');
    expect(IDLE_STATE.stages.verify).toBe('idle');
  });
});
