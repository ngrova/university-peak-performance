import { describe, it, expect } from 'vitest';
import {
  calcEfficiency,
  efficiencyGrade,
  tokensPerTaskGrade,
  costPerPrGrade,
  gradeColor,
  contextBarColor,
  spendBarColor,
} from './grades';

describe('calcEfficiency', () => {
  it('returns 0 when inputTokens is 0', () => expect(calcEfficiency(100, 0)).toBe(0));
  it('calculates correct percentage', () => expect(calcEfficiency(10, 100)).toBe(10));
  it('handles zero output', () => expect(calcEfficiency(0, 1000)).toBe(0));
});

describe('efficiencyGrade', () => {
  it('gives A+ above 8%', () => expect(efficiencyGrade(9)).toBe('A+'));
  it('gives A at 5-8%', () => expect(efficiencyGrade(6)).toBe('A'));
  it('gives B+ at 4-5%', () => expect(efficiencyGrade(4.5)).toBe('B+'));
  it('gives B at 3-4%', () => expect(efficiencyGrade(3.5)).toBe('B'));
  it('gives C at 1-2%', () => expect(efficiencyGrade(2)).toBe('C'));
  it('gives D below 1%', () => expect(efficiencyGrade(0.5)).toBe('D'));
});

describe('tokensPerTaskGrade', () => {
  it('gives A below 50K', () => expect(tokensPerTaskGrade(30)).toBe('A'));
  it('gives B at 50-99K', () => expect(tokensPerTaskGrade(75)).toBe('B'));
  it('gives C at 100-149K', () => expect(tokensPerTaskGrade(120)).toBe('C'));
  it('gives D at 150K+', () => expect(tokensPerTaskGrade(200)).toBe('D'));
});

describe('costPerPrGrade', () => {
  it('gives A below $1', () => expect(costPerPrGrade(0.5)).toBe('A'));
  it('gives B at $1-2', () => expect(costPerPrGrade(2)).toBe('B'));
  it('gives C at $3-4', () => expect(costPerPrGrade(4)).toBe('C'));
  it('gives D at $5+', () => expect(costPerPrGrade(10)).toBe('D'));
});

describe('gradeColor', () => {
  it('returns green for A+', () => expect(gradeColor('A+')).toBe('#60c860'));
  it('returns green for A', () => expect(gradeColor('A')).toBe('#60c860'));
  it('returns yellow-green for B', () => expect(gradeColor('B')).toBe('#a0c840'));
  it('returns amber for C', () => expect(gradeColor('C')).toBe('#c0a830'));
  it('returns red for D', () => expect(gradeColor('D')).toBe('#c06040'));
});

describe('contextBarColor', () => {
  it('blue at 0-25%', () => expect(contextBarColor(10)).toBe('#6090c0'));
  it('teal at 26-50%', () => expect(contextBarColor(40)).toBe('#40a890'));
  it('amber at 51-75%', () => expect(contextBarColor(60)).toBe('#c0a830'));
  it('red above 75%', () => expect(contextBarColor(90)).toBe('#c04040'));
});

describe('spendBarColor', () => {
  it('green when under 50% spent', () => expect(spendBarColor(30)).toBe('#60c860'));
  it('amber at 50-80% spent', () => expect(spendBarColor(70)).toBe('#c0a830'));
  it('red above 80% spent', () => expect(spendBarColor(90)).toBe('#c04040'));
});
