'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LifePillar, Goal, Task } from '@upp/db'
import { computeLayout, flattenTree, collectChain, DEFAULT_LAYOUT } from './tree-layout'
import TreeNodeCard from './TreeNode'
import TreeWires from './TreeWires'
import TreeControls from './TreeControls'
import { buildTree, fitViewport, CANVAS_PAD } from './tree-helpers'
import DetailPanel from './DetailPanel'

interface Props { pillars: LifePillar[]; goals: Goal[]; tasks: Task[] }

export default function TreeView({ pillars, goals, tasks }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.7)
  const [pan, setPan] = useState({ x: 80, y: 80 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [focusPillarId, setFocusPillarId] = useState<string | null>(null)
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const root = useMemo(() => buildTree(pillars, goals, tasks, focusPillarId), [pillars, goals, tasks, focusPillarId])
  const laid = useMemo(() => computeLayout(root, DEFAULT_LAYOUT), [root])
  const allNodes = useMemo(() => flattenTree(laid), [laid])
  const chainIds = useMemo(() => selectedId ? collectChain(selectedId, laid) : new Set<string>(), [selectedId, laid])
  const selectedNode = useMemo(() => allNodes.find((n) => n.id === selectedId) ?? null, [allNodes, selectedId])

  const fit = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { z, x, y } = fitViewport(allNodes, el.clientWidth, el.clientHeight, DEFAULT_LAYOUT)
    setZoom(z); setPan({ x, y })
  }, [allNodes])

  useEffect(() => { setTimeout(fit, 50) }, [focusPillarId, fit])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((z) => Math.min(3, Math.max(0.15, z - e.deltaY * 0.001)))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return
    dragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    setPan((p) => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }))
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseUp = useCallback(() => { dragging.current = false }, [])

  const handleNodeClick = useCallback((id: string) => {
    setSelectedId((prev) => prev === id ? null : id)
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return
    setSelectedId(null)
  }, [])

  const svgW = (allNodes.length ? Math.max(...allNodes.map((n) => n.x)) : 0) + DEFAULT_LAYOUT.cardW + CANVAS_PAD * 2
  const svgH = (allNodes.length ? Math.max(...allNodes.map((n) => n.y)) : 0) + DEFAULT_LAYOUT.cardH + CANVAS_PAD * 2

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#FAF7F2', cursor: dragging.current ? 'grabbing' : 'grab' }}
      onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onClick={handleCanvasClick}>
      <div style={{ position: 'absolute', left: pan.x, top: pan.y, transform: `scale(${zoom})`, transformOrigin: '0 0' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: svgW, height: svgH, pointerEvents: 'none' }}>
          <TreeWires nodes={allNodes} cardW={DEFAULT_LAYOUT.cardW} cardH={DEFAULT_LAYOUT.cardH} gapX={DEFAULT_LAYOUT.gapX} chainIds={chainIds} hasSelection={!!selectedId} />
        </svg>
        {allNodes.map((node) => (
          <div key={node.id} data-node="1">
            <TreeNodeCard node={node} cardW={DEFAULT_LAYOUT.cardW} cardH={DEFAULT_LAYOUT.cardH} dimmed={!!selectedId && !chainIds.has(node.id)} selected={node.id === selectedId} onClick={handleNodeClick} />
          </div>
        ))}
      </div>
      <TreeControls pillars={pillars} focusPillarId={focusPillarId} onFocusPillar={setFocusPillarId} onZoomIn={() => setZoom((z) => Math.min(3, z + 0.15))} onZoomOut={() => setZoom((z) => Math.max(0.15, z - 0.15))} onFit={fit} />
      {selectedNode && (selectedNode.depth >= 2) && (
        <DetailPanel node={selectedNode} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}
