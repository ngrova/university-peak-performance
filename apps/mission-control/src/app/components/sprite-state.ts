export type CrystalState = 'harmonic' | 'growing' | 'warm' | 'redline';
export type MoneyBagState = 'full' | 'half' | 'empty';
export type AlbusStateSprite = 'coding' | 'idle';

export function crystalState(inputTokens: number, contextTokens: number): CrystalState {
  const pct = contextTokens > 0 ? inputTokens / contextTokens : 0;
  if (pct < 0.25) return 'harmonic';
  if (pct < 0.50) return 'growing';
  if (pct < 0.75) return 'warm';
  return 'redline';
}

export function moneyBagState(credits: number): MoneyBagState {
  if (credits > 10) return 'full';
  if (credits > 5) return 'half';
  return 'empty';
}

export function albusState(prevOutputTokens: number, currentOutputTokens: number): AlbusStateSprite {
  return currentOutputTokens > prevOutputTokens ? 'coding' : 'idle';
}

export function crystalPulseDuration(state: CrystalState): number {
  switch (state) {
    case 'harmonic': return 3;
    case 'growing':  return 2;
    case 'warm':     return 1.2;
    case 'redline':  return 0.6;
  }
}

export function crystalSrc(state: CrystalState): string {
  return `/sprites/crystal-${state}.png`;
}

export function moneyBagSrc(state: MoneyBagState): string {
  return `/sprites/moneybag-${state}.png`;
}

export function albusSrc(state: AlbusStateSprite): string {
  return state === 'coding' ? '/sprites/albus-front.png' : '/sprites/albus-back.png';
}
