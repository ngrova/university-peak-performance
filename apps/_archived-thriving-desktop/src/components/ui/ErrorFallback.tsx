'use client'
import React from 'react'

interface ErrorFallbackProps {
  message?: string
  onRetry?: () => void
}

// Shows a user-friendly error message with an optional retry button
export default function ErrorFallback({ message, onRetry }: ErrorFallbackProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
      <div className="text-5xl mb-4">😵</div>
      <h1
        className="text-xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text-primary)' }}
      >
        Something went wrong
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        {message ?? 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--accent)', color: '#1A1410' }}
        >
          Try again
        </button>
      )}
    </div>
  )
}
