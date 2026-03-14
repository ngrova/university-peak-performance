import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock all child components so Room.test doesn't need sprites/canvas
vi.mock('./CrystalSprite', () => ({ CrystalSprite: () => null }));
vi.mock('./MoneyBagSprite', () => ({ MoneyBagSprite: () => null }));
vi.mock('./AlbusSprite', () => ({ AlbusSprite: () => null }));
vi.mock('./ApprenticeSprites', () => ({ ApprenticeSprites: () => null }));

const DEFAULT_PROPS = {
  tokens: 50_000,
  cap: 200_000,
  percent: 25,
  creditsUsage: 10,
  subagentCount: 2,
  app: 'Mission Control',
  task: 'Building v2',
};

describe('Room', () => {
  it('renders without crashing with required props', async () => {
    const { Room } = await import('./Room');
    expect(() => render(<Room {...DEFAULT_PROPS} />)).not.toThrow();
  });

  it('renders the room background div', async () => {
    const { Room } = await import('./Room');
    const { container } = render(<Room {...DEFAULT_PROPS} />);
    const roomDiv = container.querySelector('[style*="room.webp"]');
    expect(roomDiv).toBeTruthy();
  });
});
