'use client';

interface RoomProps {
  children: React.ReactNode;
}

export function Room({ children }: RoomProps) {
  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        width: '100%',
        backgroundImage: 'url(/sprites/room.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
      }}
    >
      {children}
    </div>
  );
}
