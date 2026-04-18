// ═══════════════════════════════════════════════════════════
// FILE: instrumentation.ts
// PURPOSE: Next.js instrumentation hook — initializes Sentry for
//   the server and edge runtimes. Loaded automatically by Next.js
//   via the `instrumentation.ts` convention (no explicit import).
// CALLED BY: Next.js runtime (framework convention — do not import manually).
// DATA FLOW: Next.js boots → register() runs once per runtime →
//   imports the matching Sentry config → Sentry.init() wires
//   captureException / tracing / logging for that runtime.
// ═══════════════════════════════════════════════════════════
// @deadcode-allow: Next.js framework entry point — loaded by filename convention, no inbound imports.
import * as Sentry from "@sentry/nextjs";

export async function register(): Promise<void> {
  if (process.env['NEXT_RUNTIME'] === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env['NEXT_RUNTIME'] === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
