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
  // Start: right edge of parent, vertically centered
  const x1 = parent.x + cardW
  const y1 = parent.y + cardH / 2
  const isRoot2Pillar = parent.depth === 0

  return (
    <>
      {nodeChildren.map((child) => {
        // End: left edge of child, vertically centered
        const x2 = child.x
        const y2 = child.y + cardH / 2
        const horizDist = x2 - x1
        // Root→pillar edges bow more gracefully (75%); all others 50%
        const cpRatio = isRoot2Pillar ? 0.75 : 0.5
        const cpOff = horizDist * cpRatio
        const inChain = chainIds.has(parent.id) && chainIds.has(child.id)
        const dimmed = hasSelection && !inChain
        const color = parent.pillarColor ?? child.pillarColor ?? '#9B8E80'
        const stroke = dimmed ? '#EDE8E0' : `${color}66`
        const strokeW = isRoot2Pillar ? 2.5 : 1.5

        return (
          <path
            key={`${parent.id}-${child.id}`}
            d={`M ${x1} ${y1} C ${x1 + cpOff} ${y1}, ${x2 - cpOff} ${y2}, ${x2} ${y2}`}
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
