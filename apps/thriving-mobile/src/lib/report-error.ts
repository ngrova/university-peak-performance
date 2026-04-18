// ═══════════════════════════════════════════════════════════
// FILE: report-error.ts
// PURPOSE: Centralized error reporter — forwards caught errors
//   to Sentry for observability. Single entry point so every
//   catch block is visible in the Sentry dashboard.
// CALLED BY: actions/*, lib/upload-media.ts, hooks/use-voice-recorder.ts,
//   and other catch blocks.
// DATA FLOW: catch block → reportError(err) → Sentry.captureException →
//   caller handles the user-facing error message.
// ═══════════════════════════════════════════════════════════
import * as Sentry from '@sentry/nextjs';

/**
 * Triggered by: catch blocks in server actions, client components, and
 *   library helpers.
 * Steps: normalizes non-Error inputs into an Error instance and forwards
 *   them to Sentry.captureException. Works on client, server, and edge
 *   runtimes because @sentry/nextjs initializes each automatically via
 *   instrumentation.ts + sentry.client.config.ts.
 * Returns: void — caller handles the user-facing error message.
 */
export function reportError(err: unknown): void {
  const toReport = err instanceof Error ? err : new Error(String(err));
  Sentry.captureException(toReport);
}
