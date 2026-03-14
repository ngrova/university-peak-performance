'use client'
import React from 'react'
import type { TreeNode } from './tree-layout'

interface Props {
  node: TreeNode
  cardW: number
  cardH: number
  dimmed: boolean
  selected: boolean
  onClick: (id: string) => void
}

const DEPTH_SCALE = [1.2, 1.05, 0.95, 0.88, 0.78]

function truncate(s: string, max = 45): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function getBg(node: TreeNode): React.CSSProperties {
  if (node.depth === 0) return { background: '#2D2318', color: '#FAF7F2' }
  if (node.depth === 1) {
    const c = node.pillarColor ?? '#6B5D4F'
    return { background: `linear-gradient(135deg, ${c}, ${c}cc)`, color: '#fff' }
  }
  if (node.depth === 2) {
    const c = node.color ?? node.pillarColor ?? '#6B5D4F'
    return { background: `linear-gradient(135deg, ${c}b3, ${c}80)`, color: '#fff' }
  }
  if (node.status === 'done') return { background: '#E5E7EB', color: '#9CA3AF' }
  const ready = !node.children.some((c) => c.status === 'blocked') && node.status !== 'blocked'
  if (ready) return { background: '#F0FDF4', color: '#2D2318', border: '1px solid #86EFAC' }
  const c = node.pillarColor ?? '#D97706'
  return { background: '#FAF7F2', color: '#2D2318', border: `1px solid ${c}40` }
}

export default function TreeNodeCard({ node, cardW, cardH, dimmed, selected, onClick }: Props): React.JSX.Element {
  const scale = DEPTH_SCALE[node.depth] ?? 1
  const style = getBg(node)
  const isTask = node.depth >= 3
  const isDone = node.status === 'done'
  const isFraunces = node.depth <= 2

  return (
    <div
      onClick={() => onClick(node.id)}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: cardW,
        height: cardH,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        opacity: dimmed ? 0.08 : 1,
        cursor: 'pointer',
        borderRadius: 8,
        boxShadow: selected ? '0 0 0 2px #D97706, 0 4px 16px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        transition: 'opacity 0.2s, box-shadow 0.15s',
        ...style,
      }}
    >
      {isTask && (
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.08)' }} />
      )}
      {isTask && node.failureCost === 'critical' && (
        <div style={{ position: 'absolute', top: 5, left: 5, width: 7, height: 7, borderRadius: '50%', background: '#DC2626' }} />
      )}
      {isTask && node.failureCost === 'high' && (
        <div style={{ position: 'absolute', top: 5, left: 5, width: 7, height: 7, borderRadius: '50%', background: '#F59E0B' }} />
      )}
      {isTask && node.status !== 'blocked' && node.status !== 'done' && !node.children.some((c) => c.status === 'blocked') && (
        <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
      )}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px 10px', textAlign: 'center',
        fontSize: 11,
        fontFamily: isFraunces ? 'var(--font-fraunces)' : 'var(--font-nunito, system-ui)',
        fontStyle: isFraunces ? 'italic' : 'normal',
        fontWeight: node.depth === 0 ? 700 : 600,
        textDecoration: isDone ? 'line-through' : 'none',
        lineHeight: 1.3,
      }}>
        {truncate(node.label)}
      </div>
    </div>
  )
}
