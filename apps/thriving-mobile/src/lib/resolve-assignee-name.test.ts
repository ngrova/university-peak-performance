import { describe, it, expect } from 'vitest';
import { resolveAssigneeName } from './resolve-assignee-name';

describe('resolveAssigneeName', () => {
  it('resolves from user_metadata.full_name', () => {
    const user = { user_metadata: { full_name: 'Erin Smith' }, email: 'other@x.com' };
    expect(resolveAssigneeName(user)).toBe('Erin');
  });

  it('resolves from user_metadata.name', () => {
    const user = { user_metadata: { name: 'Nick Grover' }, email: 'other@x.com' };
    expect(resolveAssigneeName(user)).toBe('Nick');
  });

  it('falls back to email handle', () => {
    const user = { user_metadata: {}, email: 'liz.jones@example.com' };
    expect(resolveAssigneeName(user)).toBe('Liz');
  });

  it('handles email with underscore separator', () => {
    const user = { user_metadata: {}, email: 'erin_doe@example.com' };
    expect(resolveAssigneeName(user)).toBe('Erin');
  });

  it('returns null for unrecognized name', () => {
    const user = { user_metadata: { full_name: 'Unknown Person' }, email: 'nobody@x.com' };
    expect(resolveAssigneeName(user)).toBeNull();
  });

  it('returns null when no metadata and email does not match', () => {
    const user = { user_metadata: {}, email: 'admin@system.com' };
    expect(resolveAssigneeName(user)).toBeNull();
  });

  it('returns null with empty user', () => {
    const user = {};
    expect(resolveAssigneeName(user)).toBeNull();
  });

  it('prefers metadata over email', () => {
    const user = { user_metadata: { full_name: 'Nick' }, email: 'erin@x.com' };
    expect(resolveAssigneeName(user)).toBe('Nick');
  });
});
