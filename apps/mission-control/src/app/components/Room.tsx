'use client';

interface RoomProps {
  children: React.ReactNode;
}

export function Room({ children }: RoomProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/sprites/room.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        zIndex: 0,
      }}
    >
      {children}
    </div>
  );
}
