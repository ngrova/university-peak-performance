import { describe, it, expect } from 'vitest';

// Pure logic extracted for testing
function defaultColorFn(val: number, avg: number): string {
  if (avg === 0) return '#8a68c0';
  const ratio = val / avg;
  if (ratio < 0.9) return '#60c860';
  if (ratio <= 1.1) return '#8a68c0';
  return '#c04040';
}

describe('sparkline color logic', () => {
  it('returns purple when avg is 0', () => {
    expect(defaultColorFn(0, 0)).toBe('#8a68c0');
  });
  it('returns green for below-average values', () => {
    expect(defaultColorFn(50, 100)).toBe('#60c860');
  });
  it('returns purple for near-average values (±10%)', () => {
    expect(defaultColorFn(100, 100)).toBe('#8a68c0');
    expect(defaultColorFn(105, 100)).toBe('#8a68c0');
    expect(defaultColorFn(90, 100)).toBe('#8a68c0');
  });
  it('returns red for above-average values', () => {
    expect(defaultColorFn(150, 100)).toBe('#c04040');
    expect(defaultColorFn(120, 100)).toBe('#c04040');
  });
});

describe('sparkline bar heights', () => {
  it('proportional to max value', () => {
    const MAX_H = 24;
    const values = [50, 100, 200];
    const maxVal = Math.max(...values);
    const heights = values.map((v) => Math.max(2, Math.round((v / maxVal) * MAX_H)));
    expect(heights[2]).toBe(24); // max bar fills height
    expect(heights[0]).toBe(6); // 50/200 * 24 = 6
    expect(heights[1]).toBe(12); // 100/200 * 24 = 12
  });
  it('minimum bar height is 2px', () => {
    const MAX_H = 24;
    const val = 0;
    const maxVal = 100;
    const h = Math.max(2, Math.round((val / maxVal) * MAX_H));
    expect(h).toBe(2);
  });
});
