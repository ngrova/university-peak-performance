'use client'
import React from 'react'
import type { TreeNode } from './tree-layout'

interface Props {
  nodes: TreeNode[]
  cardW: number
  cardH: number
  gapX: number
  chainIds: Set<string>
  hasSelection: boolean
}

function WirePaths({ parent, nodeChildren, cardW, cardH, chainIds, hasSelection }: {
  parent: TreeNode
  nodeChildren: TreeNode[]
  cardW: number
  cardH: number
  chainIds: Set<string>
  hasSelection: boolean
}): React.JSX.Element {
  const sx = parent.x + cardW
  const sy = parent.y + cardH / 2
  const isRoot2Pillar = parent.depth === 0

  return (
    <>
      {nodeChildren.map((child) => {
        const tx = child.x
        const ty = child.y + cardH / 2
        const dx = (tx - sx) * 0.5
        const inChain = chainIds.has(parent.id) && chainIds.has(child.id)
        const dimmed = hasSelection && !inChain
        const color = parent.pillarColor ?? child.pillarColor ?? '#9B8E80'
        const stroke = dimmed ? '#EDE8E0' : `${color}66`
        const strokeW = isRoot2Pillar ? 2.5 : 1.5

        return (
          <path
            key={`${parent.id}-${child.id}`}
            d={`M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
            strokeDasharray={dimmed ? '4 4' : undefined}
          />
        )
      })}
    </>
  )
}

export default function TreeWires({ nodes, cardW, cardH, gapX, chainIds, hasSelection }: Props): React.JSX.Element {
  return (
    <>
      {nodes.map((node) =>
        node.children.length > 0 ? (
          <WirePaths
            key={node.id}
            parent={node}
            nodeChildren={node.children}
            cardW={cardW}
            cardH={cardH}
            chainIds={chainIds}
            hasSelection={hasSelection}
          />
        ) : null,
      )}
    </>
  )
}
