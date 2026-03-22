// ═══════════════════════════════════════════════════════════
// FILE: report-error.ts
// PURPOSE: Centralized error reporter — captures errors for
//   observability. Currently a thin wrapper; swap the body to
//   Sentry captureException when Sentry is installed.
// CALLED BY: actions/goal-crud-actions.ts (and future actions)
// DATA FLOW: Server action catch block → reportError(err) →
//   error is captured for debugging → caller returns user message
// ═══════════════════════════════════════════════════════════

/**
 * Triggered by: catch blocks in server actions.
 * Steps: receives the caught error, captures it for observability.
 *   Currently writes to stderr (visible in Netlify function logs).
 *   Replace body with captureException() when Sentry is added.
 * Returns: void — caller handles the user-facing error message.
 */
export function reportError(err: unknown): void {
  // stderr is captured by Netlify function logs (unlike console.log)
  const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
  process.stderr.write(`[error] ${detail}\n`);
}
