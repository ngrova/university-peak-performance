# Plan: Wire Sentry browser-auth into thriving-mobile

## TYPE
TYPE: FEATURE

## Task
`apps/thriving-mobile/src/lib/report-error.ts` is a placeholder that writes to `console.error` on the client and `process.stderr` on the server — documented as "replace with Sentry later." Sentry hasn't been wired since bootstrap. Every PR touching a file that imports `reportError` now fails the Council's forbidden-`console.error` rule (this is what blocked PR #204's Council and required an admin-merge).

Wire Sentry end-to-end so `reportError()` delegates to `Sentry.captureException()`.

## Approach
1. **Nick runs the Sentry wizard** (browser OAuth, `upp-wz` org, `thriving-mobile` project):
   - `cd apps/thriving-mobile && npx @sentry/wizard@latest -i nextjs`
   - The wizard installs `@sentry/nextjs`, writes `sentry.{client,server,edge}.config.ts`, wraps `next.config.mjs` with `withSentryConfig`, and seeds `SENTRY_DSN` + `SENTRY_AUTH_TOKEN` into Netlify env (or local `.env.sentry-build-plugin`).
2. **I rewrite `report-error.ts`** to call `Sentry.captureException(err)` (with a fallback `console.error` only when Sentry isn't initialized — so local dev without DSN still shows errors). This preserves the existing `reportError(err)` API; no callers need to change.
3. **Update `DELEGATION.md`** status row for Sentry from "TBD — wizard pending" to "Provisioned, DSN wired."
4. **Update `project.yml`** `sentry.dsn` from `TBD` to the actual DSN (or `WIRED` — DSN is a public-key-like value so either works).

## Files to Change
- `apps/thriving-mobile/src/lib/report-error.ts` — delegate to `Sentry.captureException`, drop `console.error` primary path
- `apps/thriving-mobile/next.config.mjs` — wrapped by `withSentryConfig` (wizard does this)
- `apps/thriving-mobile/package.json` — `@sentry/nextjs` added (wizard does this)
- `DELEGATION.md` — Sentry status row
- `project.yml` — Sentry DSN field

## New Files
- `apps/thriving-mobile/sentry.client.config.ts` — wizard output
- `apps/thriving-mobile/sentry.server.config.ts` — wizard output
- `apps/thriving-mobile/sentry.edge.config.ts` — wizard output
- `apps/thriving-mobile/instrumentation.ts` — wizard may add this
- `plans/nick-wire-sentry-browser-auth.md` — this plan

## Scope
medium (~5-8 files — mostly wizard-generated)

## PRE-PLAN PUSHBACK
PUSHBACK-PREPLAN: CLEAR-nick/wire-sentry-browser-auth

No concerns. Sentry was always the planned replacement for `report-error.ts`'s placeholder body; we're running the pending Bootstrap Step 7b. The wizard is interactive OAuth so Nick runs it, not me.

## Open PRs Addressed
None open.

## COUNCIL PLAN REVIEW
RESULT: SKIPPED-LOCAL-ADVISORY

Local Council skipped; CI Council is the hard gate.

## PUSHBACK RESOLVED
PUSHBACK-RESOLVED: N/A

## HUMAN APPROVAL
STATUS: CONFIRMED

Nick ran the wizard; implementation followed per plan.

## POST-BUILD PUSHBACK
PUSHBACK-POSTBUILD: CLEAR-nick/wire-sentry-browser-auth

Typecheck passes, 43/43 unit tests pass. Surprises during build:
1. Nick missed the Claude Code checkbox in the MCP editor selector — wrote `.mcp.json` manually to match what the wizard would have produced
2. Netlify CLI auth is forbidden from my shell (can read env vars, can't write). `SENTRY_AUTH_TOKEN` is set as a GitHub Actions secret but Netlify env needs a manual paste via the UI. Without it Sentry still captures errors (DSN is hardcoded in the config files); we lose only source-map pretty-printing in stack traces during Netlify builds.
3. Wizard added `src/instrumentation-client.ts` (new Next.js pattern) instead of `sentry.client.config.ts` (old pattern). Plan listed old file name — no-op here because the wizard chose the correct modern pattern.

## COUNCIL CODE REVIEW
RESULT: SKIPPED-LOCAL-ADVISORY

Local skipped; CI Council is the hard gate.

## RETROSPECTIVE
RETROSPECTIVE: PENDING
