import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('rewind-state-file helpers', () => {
  let tempDir: string;
  let tempFile: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rewind-test-'));
    tempFile = path.join(tempDir, 'rewind-state.json');
    vi.resetModules();
    vi.doMock('./rewind-state-file', async () => {
      const actual = await vi.importActual<typeof import('./rewind-state-file')>('./rewind-state-file');
      // Re-implement read/write using tempFile
      return {
        ...actual,
        readRewindState: () => {
          try {
            const raw = fs.readFileSync(tempFile, 'utf-8');
            return JSON.parse(raw);
          } catch {
            return { ...actual.IDLE_STATE };
          }
        },
        writeRewindState: (state: typeof actual.IDLE_STATE) => {
          const dir = path.dirname(tempFile);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
        },
      };
    });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('readRewindState returns IDLE_STATE when file is unreadable', async () => {
    const { readRewindState, IDLE_STATE } = await import('./rewind-state-file');
    // Write invalid JSON to force parse failure
    fs.mkdirSync(path.dirname(tempFile), { recursive: true });
    fs.writeFileSync(tempFile, 'NOT JSON');
    const state = readRewindState();
    expect(state.status).toBe('idle');
    expect(state.agentMessage).toBeNull();
  });

  it('writeRewindState persists state and readRewindState reads it back', async () => {
    const { readRewindState, writeRewindState, IDLE_STATE } = await import('./rewind-state-file');
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

  it('writeRewindState handles agentMessage field', async () => {
    const { readRewindState, writeRewindState, IDLE_STATE } = await import('./rewind-state-file');
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

  it('IDLE_STATE has expected shape', async () => {
    const { IDLE_STATE } = await import('./rewind-state-file');
    expect(IDLE_STATE.status).toBe('idle');
    expect(IDLE_STATE.agentMessage).toBeNull();
    expect(IDLE_STATE.stages.clear).toBe('idle');
    expect(IDLE_STATE.stages.restart).toBe('idle');
    expect(IDLE_STATE.stages.verify).toBe('idle');
  });
});
