// ═══════════════════════════════════════════════════════════
// FILE: report-error.ts
// PURPOSE: Centralized error reporter — captures errors for
//   observability. Works in both browser and server environments.
//   Swap the body to Sentry captureException when Sentry is added.
// CALLED BY: actions/*, lib/upload-media.ts, and other catch blocks
// DATA FLOW: catch block → reportError(err) → error is captured
//   for debugging → caller handles the user-facing error message
// ═══════════════════════════════════════════════════════════

/**
 * Triggered by: catch blocks in server actions and client-side code.
 * Steps: receives the caught error, captures it for observability.
 *   Server: writes to stderr (Netlify function logs). Browser: writes
 *   to console.error (visible in DevTools). Replace with Sentry later.
 * Returns: void — caller handles the user-facing error message.
 */
export function reportError(err: unknown): void {
  const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
  // Browser: use console.error (DevTools). Server: use stderr (Netlify logs).
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(`[reportError] ${detail}`);
  } else {
    process.stderr.write(`[error] ${detail}\n`);
  }
}
