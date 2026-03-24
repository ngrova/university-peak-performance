import { useCallback, useRef, useState } from 'react'
import React from 'react'

export interface PanZoomHandlers {
  zoom: number
  pan: { x: number; y: number }
  setZoom: React.Dispatch<React.SetStateAction<number>>
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  onWheel: (e: React.WheelEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
  isDragging: boolean
}

const ZOOM_MIN = 0.15
const ZOOM_MAX = 3

function touchDist(t: React.TouchList): number {
  const a = t.item(0)
  const b = t.item(1)
  if (!a || !b) return 0
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

export function usePanZoom(initialZoom = 0.7): PanZoomHandlers {
  const [zoom, setZoom] = useState(initialZoom)
  const [pan, setPan] = useState({ x: 80, y: 80 })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const lastPinchDist = useRef<number | null>(null)

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z - e.deltaY * 0.001)))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    setPan((p) => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }))
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseUp = useCallback(() => { dragging.current = false }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t0 = e.touches.item(0)
    if (e.touches.length === 1 && t0) {
      if ((e.target as HTMLElement).closest('[data-node]')) return
      dragging.current = true
      lastPos.current = { x: t0.clientX, y: t0.clientY }
      lastPinchDist.current = null
    } else if (e.touches.length === 2) {
      dragging.current = false
      lastPinchDist.current = touchDist(e.touches)
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const t0 = e.touches.item(0)
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dist = touchDist(e.touches)
      setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + (dist - lastPinchDist.current!) * 0.005)))
      lastPinchDist.current = dist
    } else if (e.touches.length === 1 && dragging.current && t0) {
      setPan((p) => ({ x: p.x + t0.clientX - lastPos.current.x, y: p.y + t0.clientY - lastPos.current.y }))
      lastPos.current = { x: t0.clientX, y: t0.clientY }
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    dragging.current = false
    lastPinchDist.current = null
  }, [])

  return {
    zoom, pan, setZoom, setPan,
    onWheel, onMouseDown, onMouseMove, onMouseUp,
    onTouchStart, onTouchMove, onTouchEnd,
    isDragging: dragging.current,
  }
}
