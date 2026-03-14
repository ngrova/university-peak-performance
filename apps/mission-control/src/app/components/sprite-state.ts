export type AlbusStateSprite = 'coding' | 'idle';

export function albusState(prevOutputTokens: number, currentOutputTokens: number): AlbusStateSprite {
  return currentOutputTokens > prevOutputTokens ? 'coding' : 'idle';
}

export function albusSrc(_state: AlbusStateSprite): string {
  return '/sprites/albus.png';
}
