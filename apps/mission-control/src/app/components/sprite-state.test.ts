import { describe, it, expect } from 'vitest';
import { albusState } from './sprite-state';

describe('albusState', () => {
  it('returns coding when outputTokens increased', () => {
    expect(albusState(100, 200)).toBe('coding');
  });

  it('returns idle when outputTokens same or decreased', () => {
    expect(albusState(200, 200)).toBe('idle');
    expect(albusState(200, 100)).toBe('idle');
  });
});
