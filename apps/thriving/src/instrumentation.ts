// Registers Sentry instrumentation for Next.js server-side tracing
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
}
