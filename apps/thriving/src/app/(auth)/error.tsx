'use client'
import React, { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import ErrorFallback from '@/components/ui/ErrorFallback'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Catches render errors in any auth route (login, signup, etc.)
export default function AuthError({ error, reset }: ErrorProps): React.JSX.Element {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return <ErrorFallback message="Something went wrong. Please try logging in again." onRetry={reset} />
}
