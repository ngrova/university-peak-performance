'use client'
import React, { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Catches errors in the root layout — last line of defense against white screens
export default function GlobalError({ error, reset }: GlobalErrorProps): React.JSX.Element {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#1A1410', color: '#F5F0EB' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😵</div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Something went wrong</h1>
          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '24px' }}>An unexpected error occurred. Please try again.</p>
          <button
            onClick={reset}
            style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: '#D4A373', color: '#1A1410', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
