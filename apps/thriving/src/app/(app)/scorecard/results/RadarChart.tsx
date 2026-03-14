'use client'
import React, { useRef, useEffect } from 'react'
import { DOMAINS } from '@/lib/scorecard-constants'
import type { DomainAverages } from '@upp/db'

interface Props {
  domainAverages: DomainAverages
}

const SIZE = 340
const CENTER = SIZE / 2
const RADIUS = 120
const RINGS = [2, 4, 6, 8, 10]

function angleFor(i: number): number {
  return (Math.PI * 2 * i) / DOMAINS.length - Math.PI / 2
}

function point(value: number, i: number): [number, number] {
  const angle = angleFor(i)
  const r = (value / 10) * RADIUS
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)]
}

export default function RadarChart({ domainAverages }: Props): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scores = DOMAINS.map((d) => domainAverages[d.key] ?? 0)
    const startTime = performance.now()
    const duration = 1000

    function draw(now: number) {
      if (!ctx) return
      const t = Math.min(1, (now - startTime) / duration)
      ctx.clearRect(0, 0, SIZE, SIZE)

      // Rings
      for (const ring of RINGS) {
        ctx.beginPath()
        DOMAINS.forEach((_, i) => {
          const [x, y] = point(ring, i)
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Spokes
      for (let i = 0; i < DOMAINS.length; i++) {
        ctx.beginPath()
        ctx.moveTo(CENTER, CENTER)
        const [x, y] = point(10, i)
        ctx.lineTo(x, y)
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Score polygon (animated)
      ctx.beginPath()
      scores.forEach((s, i) => {
        const [x, y] = point(s * t, i)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)'
      ctx.fill()
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 2.5
      ctx.stroke()

      if (t < 1) requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)
  }, [domainAverages])

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="mx-auto block" />
      {DOMAINS.map((d, i) => {
        const angle = angleFor(i)
        const labelR = RADIUS + 32
        const lx = CENTER + labelR * Math.cos(angle)
        const ly = CENTER + labelR * Math.sin(angle)
        return (
          <span
            key={d.key}
            className="absolute text-base leading-none select-none pointer-events-none"
            style={{ left: lx, top: ly, transform: 'translate(-50%,-50%)' }}
            title={d.name}
          >
            {d.icon}
          </span>
        )
      })}
    </div>
  )
}
