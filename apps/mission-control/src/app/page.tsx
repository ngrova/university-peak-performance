'use client';

import { Room } from './components/Room';

export default function MissionControlPage() {
  return (
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#1a0e06',
      }}
    >
      <Room />
    </main>
  );
}
