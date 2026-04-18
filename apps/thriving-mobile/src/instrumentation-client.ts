// ═══════════════════════════════════════════════════════════
// FILE: instrumentation-client.ts
// PURPOSE: Next.js client-side instrumentation hook — initializes
//   Sentry in the browser for error capture, performance tracing,
//   and session replay. Loaded automatically by Next.js via the
//   `instrumentation-client.ts` convention (no explicit import).
// CALLED BY: Next.js runtime on the client (framework convention — do not import manually).
// DATA FLOW: Browser loads a page → Next.js runs this file once →
//   Sentry.init() wires captureException / tracing / replay →
//   onRouterTransitionStart hooks into App Router navigations.
// ═══════════════════════════════════════════════════════════
// @deadcode-allow: Next.js framework entry point — loaded by filename convention, no inbound imports.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env['NEXT_PUBLIC_SENTRY_DSN'],

  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: 1,
  enableLogs: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
