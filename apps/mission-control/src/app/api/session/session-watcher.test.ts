import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SessionData } from './parse-session';

// Mock fs before importing the module under test
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
    watch: vi.fn(),
  },
}));

// Mock parse-session
vi.mock('./parse-session', () => ({
  parseSessionOutput: vi.fn(),
}));

import fs from 'fs';
import { parseSessionOutput } from './parse-session';
import { readSessionData, watchSessionFile } from './session-watcher';

const mockReadFileSync = vi.mocked(fs.readFileSync);
const mockWatch = vi.mocked(fs.watch);
const mockParseSessionOutput = vi.mocked(parseSessionOutput);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('readSessionData', () => {
  it('returns parsed data when file exists', () => {
    const expected: SessionData = { tokens: 10000, cap: 200000, percent: 5 };
    mockReadFileSync.mockReturnValue('{"sessions":[]}');
    mockParseSessionOutput.mockReturnValue(expected);

    const result = readSessionData();
    expect(result).toEqual(expected);
  });

  it('returns fallback when file read throws', () => {
    mockReadFileSync.mockImplementation(() => { throw new Error('ENOENT'); });

    const result = readSessionData();
    expect(result).toEqual({ tokens: 0, cap: 200_000, percent: 0, systemTokens: 0, convoTokens: 0 });
  });
});

describe('watchSessionFile', () => {
  it('calls onChange when file change event fires', () => {
    const onChange = vi.fn();
    // Use array so TS knows mutation happens inside the closure
    const captured: Array<() => void> = [];

    const mockWatcher = {
      on: vi.fn(),
      close: vi.fn(),
    };

    mockWatch.mockImplementation((_path, cb) => {
      captured.push(cb as () => void);
      return mockWatcher as unknown as fs.FSWatcher;
    });

    const expected: SessionData = { tokens: 5000, cap: 200000, percent: 3 };
    mockReadFileSync.mockReturnValue('{}');
    mockParseSessionOutput.mockReturnValue(expected);

    watchSessionFile(onChange);

    expect(captured).toHaveLength(1);
    captured[0]!();

    expect(onChange).toHaveBeenCalledWith(expected);
  });

  it('returns cleanup function that closes watcher', () => {
    const mockWatcher = { on: vi.fn(), close: vi.fn() };
    mockWatch.mockReturnValue(mockWatcher as unknown as fs.FSWatcher);

    const cleanup = watchSessionFile(vi.fn());
    cleanup();

    expect(mockWatcher.close).toHaveBeenCalled();
  });

  it('does not throw when fs.watch throws (file missing)', () => {
    mockWatch.mockImplementation(() => { throw new Error('ENOENT'); });

    expect(() => watchSessionFile(vi.fn())).not.toThrow();
  });
});
