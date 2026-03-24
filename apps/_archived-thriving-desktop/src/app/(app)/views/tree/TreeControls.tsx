'use client'
import React from 'react'
import type { LifePillar } from '@upp/db'

interface Props {
  pillars: LifePillar[]
  focusPillarId: string | null
  onFocusPillar: (id: string | null) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
}

export default function TreeControls({ pillars, focusPillarId, onFocusPillar, onZoomIn, onZoomOut, onFit }: Props): React.JSX.Element {
  const btnBase: React.CSSProperties = {
    width: 32, height: 32, border: '1px solid #E5DFD6', borderRadius: 6,
    background: '#FAF7F2', color: '#2D2318', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 600,
  }

  const pillBase: React.CSSProperties = {
    padding: '4px 10px', borderRadius: 20, border: '1px solid #E5DFD6',
    fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500,
    transition: 'all 0.15s',
  }

  return (
    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <button style={btnBase} onClick={onZoomIn} title="Zoom in">+</button>
        <button style={btnBase} onClick={onZoomOut} title="Zoom out">−</button>
        <button style={{ ...btnBase, width: 'auto', padding: '0 10px', fontSize: 12 }} onClick={onFit}>Fit</button>
      </div>
      <div style={{ display: 'flex', gap: 6, maxWidth: 300, overflowX: 'auto', paddingBottom: 2 }}>
        <button
          style={{ ...pillBase, background: focusPillarId === null ? '#2D2318' : '#FAF7F2', color: focusPillarId === null ? '#FAF7F2' : '#2D2318' }}
          onClick={() => onFocusPillar(null)}
        >
          🌍 All
        </button>
        {pillars.map((p) => (
          <button
            key={p.id}
            style={{ ...pillBase, background: focusPillarId === p.id ? p.color : '#FAF7F2', color: focusPillarId === p.id ? '#fff' : '#2D2318' }}
            onClick={() => onFocusPillar(focusPillarId === p.id ? null : p.id)}
          >
            {p.icon} {p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
