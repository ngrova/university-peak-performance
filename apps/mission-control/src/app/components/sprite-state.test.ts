import { describe, it, expect } from 'vitest';
import { crystalState, moneyBagState, albusState, crystalPulseDuration } from './sprite-state';

describe('crystalState', () => {
  it('returns harmonic when pct < 25%', () => {
    expect(crystalState(0, 200_000)).toBe('harmonic');
    expect(crystalState(49_999, 200_000)).toBe('harmonic');
  });

  it('returns growing when pct is 25–50%', () => {
    expect(crystalState(50_000, 200_000)).toBe('growing');
    expect(crystalState(99_999, 200_000)).toBe('growing');
  });

  it('returns warm when pct is 50–75%', () => {
    expect(crystalState(100_000, 200_000)).toBe('warm');
    expect(crystalState(149_999, 200_000)).toBe('warm');
  });

  it('returns redline when pct >= 75%', () => {
    expect(crystalState(150_000, 200_000)).toBe('redline');
    expect(crystalState(200_000, 200_000)).toBe('redline');
  });

  it('returns harmonic when contextTokens is zero', () => {
    expect(crystalState(0, 0)).toBe('harmonic');
  });
});

describe('moneyBagState', () => {
  it('returns full when credits > 10', () => {
    expect(moneyBagState(10.01)).toBe('full');
    expect(moneyBagState(100)).toBe('full');
  });

  it('returns half when credits 5–10', () => {
    expect(moneyBagState(10)).toBe('half');
    expect(moneyBagState(5.01)).toBe('half');
  });

  it('returns empty when credits <= 5', () => {
    expect(moneyBagState(5)).toBe('empty');
    expect(moneyBagState(0)).toBe('empty');
  });
});

describe('albusState', () => {
  it('returns coding when outputTokens increased', () => {
    expect(albusState(100, 200)).toBe('coding');
  });

  it('returns idle when outputTokens same or decreased', () => {
    expect(albusState(200, 200)).toBe('idle');
    expect(albusState(200, 100)).toBe('idle');
  });
});

describe('crystalPulseDuration', () => {
  it('returns correct durations per state', () => {
    expect(crystalPulseDuration('harmonic')).toBe(3);
    expect(crystalPulseDuration('growing')).toBe(2);
    expect(crystalPulseDuration('warm')).toBe(1.2);
    expect(crystalPulseDuration('redline')).toBe(0.6);
  });
});
