'use client';

import { Fireplace } from './Fireplace';

interface Props {
  isDark?: boolean;
  children: React.ReactNode;
}

function Candle({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="candle-flame" style={{ width: 6, height: 10, background: 'radial-gradient(ellipse at 50% 80%, #fef08a, #f97316)', borderRadius: '50% 50% 0 0' }} />
      <div style={{ width: 6, height: 18, background: '#e5d5b0', borderRadius: 1 }} />
    </div>
  );
}

function Bookshelf({ books }: { books: string[] }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 52, padding: '4px 6px', background: '#3a2415', borderRadius: 2, border: '2px solid #2a1a0e' }}>
      {books.map((color, i) => (
        <div key={i} style={{ width: 8 + (i % 3), height: 32 + (i % 5) * 3, background: color, borderRadius: 1 }} />
      ))}
    </div>
  );
}

const LEFT_BOOKS = ['#c0392b','#2980b9','#27ae60','#8e44ad','#e67e22','#2c3e50','#16a085','#d35400','#7f8c8d','#1abc9c'];
const RIGHT_BOOKS = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#f39c12','#34495e','#1abc9c','#e67e22','#95a5a6','#27ae60'];

export function Room({ isDark, children }: Props) {
  return (
    <div className="room-wall" style={{ position: 'relative', width: 640, height: 480, overflow: 'hidden', margin: '0 auto' }}>
      {/* dark overlay at high token % */}
      {isDark && <div className="room-darken" style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }} />}

      {/* Top wall (stone) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, background: '#3d2b1a', borderBottom: '4px solid #2a1a0e' }}>
        {/* Bookshelves top-left */}
        <div style={{ position: 'absolute', left: 20, top: 24 }}><Bookshelf books={LEFT_BOOKS} /></div>
        <div style={{ position: 'absolute', left: 140, top: 24 }}><Bookshelf books={RIGHT_BOOKS} /></div>
        {/* Arched window */}
        <div style={{ position: 'absolute', right: 60, top: 12, width: 80, height: 70 }}>
          <div className="window-light" style={{ width: 80, height: 56, borderRadius: '40px 40px 0 0', border: '3px solid #2a1a0e' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', width: 3, height: 56, background: '#2a1a0e', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 3, background: '#2a1a0e', transform: 'translateY(-50%)' }} />
        </div>
        {/* Candles on wall sconces */}
        <Candle x={310} y={30} />
        <Candle x={340} y={30} />
      </div>

      {/* Floor */}
      <div className="room-floor" style={{ position: 'absolute', top: 100, left: 0, right: 0, bottom: 0 }} />

      {/* Fireplace bottom-left */}
      <div style={{ position: 'absolute', bottom: 16, left: 24 }}>
        <Fireplace />
      </div>

      {/* Plants bottom-center */}
      <div style={{ position: 'absolute', bottom: 20, left: 310, display: 'flex', gap: 4 }}>
        <div style={{ width: 16, height: 32, background: '#2d6a2d', borderRadius: '40% 40% 0 0', border: '2px solid #1a4a1a' }} />
        <div style={{ width: 12, height: 24, background: '#3a8a3a', borderRadius: '40% 40% 0 0', border: '2px solid #1a4a1a' }} />
        <div style={{ width: 14, height: 28, background: '#2d6a2d', borderRadius: '40% 40% 0 0', border: '2px solid #1a4a1a' }} />
      </div>

      {children}
    </div>
  );
}
