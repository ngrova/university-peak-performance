'use client'
import React, { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import ErrorFallback from '@/components/ui/ErrorFallback'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Catches render errors in any authenticated (app) route
export default function AppError({ error, reset }: ErrorProps): React.JSX.Element {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return <ErrorFallback onRetry={reset} />
}
