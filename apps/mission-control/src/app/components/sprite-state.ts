export type AlbusStateSprite = 'coding' | 'idle';

export function albusState(prevOutputTokens: number, currentOutputTokens: number): AlbusStateSprite {
  return currentOutputTokens > prevOutputTokens ? 'coding' : 'idle';
}

export function albusSrc(state: AlbusStateSprite): string {
  return state === 'coding' ? '/sprites/albus-front.png' : '/sprites/albus-back.png';
}
