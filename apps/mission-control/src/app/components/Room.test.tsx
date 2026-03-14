import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('./AlbusSprite', () => ({ AlbusSprite: () => null }));
vi.mock('./ApprenticeSprites', () => ({ ApprenticeSprites: () => null }));

describe('Room', () => {
  it('renders without crashing', async () => {
    const { Room } = await import('./Room');
    expect(() => render(<Room><div /></Room>)).not.toThrow();
  });

  it('renders the room background div', async () => {
    const { Room } = await import('./Room');
    const { container } = render(<Room><div /></Room>);
    const roomDiv = container.querySelector('[style*="room.webp"]');
    expect(roomDiv).toBeTruthy();
  });
});
