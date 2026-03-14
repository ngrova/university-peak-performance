'use client';

export function Fireplace() {
  return (
    <div className="flex flex-col items-center" style={{ width: 72, height: 72 }}>
      {/* mantle */}
      <div style={{ width: 72, height: 8, background: '#5a3e28', border: '2px solid #3a2618' }} />
      {/* opening */}
      <div style={{ position: 'relative', width: 60, height: 48, background: '#1a1008', border: '2px solid #3a2618' }}>
        {/* flames */}
        <div className="fire-layer-1" style={{
          position: 'absolute', bottom: 0, left: 8, width: 44, height: 28,
          background: 'radial-gradient(ellipse at 50% 100%, #f97316 0%, #ef4444 50%, transparent 100%)',
          borderRadius: '60% 60% 0 0',
        }} />
        <div className="fire-layer-2" style={{
          position: 'absolute', bottom: 0, left: 18, width: 28, height: 36,
          background: 'radial-gradient(ellipse at 50% 100%, #fbbf24 0%, #f97316 60%, transparent 100%)',
          borderRadius: '60% 60% 0 0',
        }} />
        <div className="fire-layer-3" style={{
          position: 'absolute', bottom: 0, left: 22, width: 16, height: 28,
          background: 'radial-gradient(ellipse at 50% 100%, #fef08a 0%, #fbbf24 80%, transparent 100%)',
          borderRadius: '60% 60% 0 0',
        }} />
        {/* embers */}
        <div style={{ position: 'absolute', bottom: 2, left: 6, width: 4, height: 4, borderRadius: '50%', background: '#fbbf24', opacity: 0.8 }} />
        <div style={{ position: 'absolute', bottom: 2, left: 48, width: 3, height: 3, borderRadius: '50%', background: '#f97316', opacity: 0.7 }} />
      </div>
      {/* hearth base */}
      <div style={{ width: 72, height: 8, background: '#4a3020', border: '2px solid #3a2618' }} />
    </div>
  );
}
