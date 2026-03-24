import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePanZoom } from './usePanZoom'

describe('usePanZoom', () => {
  it('initializes with default zoom and pan', () => {
    const { result } = renderHook(() => usePanZoom())
    expect(result.current.zoom).toBe(0.7)
    expect(result.current.pan).toEqual({ x: 80, y: 80 })
  })

  it('accepts custom initial zoom', () => {
    const { result } = renderHook(() => usePanZoom(1.5))
    expect(result.current.zoom).toBe(1.5)
  })

  it('clamps zoom at ZOOM_MIN on onWheel scroll down', () => {
    const { result } = renderHook(() => usePanZoom(0.16))
    act(() => {
      result.current.onWheel({ preventDefault: () => {}, deltaY: 1000 } as unknown as React.WheelEvent)
    })
    expect(result.current.zoom).toBe(0.15)
  })

  it('clamps zoom at ZOOM_MAX on onWheel scroll up', () => {
    const { result } = renderHook(() => usePanZoom(2.99))
    act(() => {
      result.current.onWheel({ preventDefault: () => {}, deltaY: -1000 } as unknown as React.WheelEvent)
    })
    expect(result.current.zoom).toBe(3)
  })

  it('updates pan on mouse drag sequence', () => {
    const { result } = renderHook(() => usePanZoom())
    const makeMouseEvent = (x: number, y: number, target = document.createElement('div')) =>
      ({ clientX: x, clientY: y, target } as unknown as React.MouseEvent)

    act(() => { result.current.onMouseDown(makeMouseEvent(100, 100)) })
    act(() => { result.current.onMouseMove(makeMouseEvent(110, 120)) })
    expect(result.current.pan).toEqual({ x: 90, y: 100 })
    act(() => { result.current.onMouseUp() })
    act(() => { result.current.onMouseMove(makeMouseEvent(200, 200)) })
    // After mouseUp, pan should not change
    expect(result.current.pan).toEqual({ x: 90, y: 100 })
  })

  it('setZoom and setPan are exposed', () => {
    const { result } = renderHook(() => usePanZoom())
    act(() => { result.current.setZoom(1.2) })
    expect(result.current.zoom).toBe(1.2)
    act(() => { result.current.setPan({ x: 50, y: 60 }) })
    expect(result.current.pan).toEqual({ x: 50, y: 60 })
  })
})
