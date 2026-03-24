'use client'
import React from 'react'
import type { TreeNode } from './tree-layout'

const COST_COLOR: Record<string, string> = { critical: '#DC2626', high: '#EA580C', medium: '#D97706', low: '#9B8E80' }
const STATUS_COLOR: Record<string, string> = { todo: '#64748B', in_progress: '#D97706', done: '#10B981', blocked: '#F59E0B' }

interface Props { node: TreeNode; onClose: () => void }

export default function DetailPanel({ node, onClose }: Props): React.JSX.Element {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff',
      borderTop: '1px solid #E5DFD6', padding: '16px 24px', zIndex: 50,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.10)', display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-fraunces)', fontStyle: 'italic', fontSize: 17, fontWeight: 700, color: '#2D2318', marginBottom: 6 }}>
          {node.label}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {node.failureCost && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: `${COST_COLOR[node.failureCost]}20`, color: COST_COLOR[node.failureCost] }}>
              {node.failureCost}
            </span>
          )}
          {node.status && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: `${STATUS_COLOR[node.status] ?? '#64748B'}20`, color: STATUS_COLOR[node.status] ?? '#64748B' }}>
              {node.status.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #E5DFD6', background: '#FAF7F2', cursor: 'pointer', fontSize: 13 }}
      >
        Close
      </button>
    </div>
  )
}
