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

function WirePaths({ parent, nodeChildren, cardW, cardH, gapX, chainIds, hasSelection }: {
  parent: TreeNode
  nodeChildren: TreeNode[]
  cardW: number
  cardH: number
  gapX: number
  chainIds: Set<string>
  hasSelection: boolean
}): React.JSX.Element {
  const px = parent.x + cardW
  const py = parent.y + cardH / 2
  const cpOffset = gapX * 0.5
  const isRoot2Pillar = parent.depth === 0

  return (
    <>
      {nodeChildren.map((child) => {
        const cx = child.x
        const cy = child.y + cardH / 2
        const inChain = chainIds.has(parent.id) && chainIds.has(child.id)
        const dimmed = hasSelection && !inChain
        const color = parent.pillarColor ?? child.pillarColor ?? '#9B8E80'
        const stroke = dimmed ? '#EDE8E0' : `${color}66`
        const strokeW = isRoot2Pillar ? 2.5 : 1.5

        return (
          <path
            key={`${parent.id}-${child.id}`}
            d={`M ${px} ${py} C ${px + cpOffset} ${py}, ${cx - cpOffset} ${cy}, ${cx} ${cy}`}
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
            gapX={gapX}
            chainIds={chainIds}
            hasSelection={hasSelection}
          />
        ) : null,
      )}
    </>
  )
}
