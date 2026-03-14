/** Grade calculation utilities for Albus's Lookout v2 */

export function calcEfficiency(outputTokens: number, inputTokens: number): number {
  if (inputTokens === 0) return 0;
  return (outputTokens / inputTokens) * 100;
}

export function efficiencyGrade(pct: number): string {
  if (pct > 8) return 'A+';
  if (pct >= 5) return 'A';
  if (pct >= 4) return 'B+';
  if (pct >= 3) return 'B';
  if (pct >= 1) return 'C';
  return 'D';
}

export function tokensPerTaskGrade(kTokens: number): string {
  if (kTokens < 50) return 'A';
  if (kTokens < 100) return 'B';
  if (kTokens < 150) return 'C';
  return 'D';
}

export function costPerPrGrade(cost: number): string {
  if (cost < 1) return 'A';
  if (cost < 3) return 'B';
  if (cost < 5) return 'C';
  return 'D';
}

export function gradeColor(grade: string): string {
  if (grade === 'A+' || grade === 'A') return '#60c860';
  if (grade === 'B') return '#a0c840';
  if (grade === 'C') return '#c0a830';
  return '#c06040';
}

export function contextBarColor(pct: number): string {
  if (pct <= 25) return '#6090c0';
  if (pct <= 50) return '#40a890';
  if (pct <= 75) return '#c0a830';
  return '#c04040';
}

export function spendBarColor(spentPct: number): string {
  if (spentPct <= 50) return '#60c860';
  if (spentPct <= 80) return '#c0a830';
  return '#c04040';
}
