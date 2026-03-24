'use client'
import React, { useEffect, useRef } from 'react'

interface CelebrationOverlayProps {
  taskTitle: string
  onDismiss: () => void
}

export default function CelebrationOverlay({ taskTitle, onDismiss }: CelebrationOverlayProps): React.JSX.Element {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 2000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onDismiss])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Task complete"
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="flex flex-col items-center gap-4 text-center px-8"
        style={{ animation: 'celebrationIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 80, height: 80, backgroundColor: '#10B981' }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path
              d="M8 20 L17 29 L32 12"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'checkDraw 0.4s ease 0.2s forwards', strokeDasharray: 40, strokeDashoffset: 40 }}
            />
          </svg>
        </div>
        <p className="font-bold text-white" style={{ fontFamily: 'Fraunces, serif', fontSize: 28 }}>
          Done!
        </p>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>{taskTitle}</p>
      </div>
      <style>{`
        @keyframes celebrationIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes checkDraw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
