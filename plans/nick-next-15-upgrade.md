# Plan: Next 14.2.35 → 15.5.15 upgrade

## TYPE
TYPE: FEATURE

## Task
Upgrade `next` from 14.2.35 → 15.5.15 in `apps/thriving-mobile/` to clear the 6 remaining high-severity CVEs that have been blocking the `Dependency Audit` CI gate since the pipeline adoption. The CVE is `GHSA-q4gf-8mx6-v5v3` (Next.js DoS with Server Components), patched in 15.5.15.

This closes the last loose end from the adoption loop: every future PR will land without needing admin-bypass on dep-audit.

## Approach
1. Run `npx @next/codemod@canary upgrade latest` against `apps/thriving-mobile/`, targeting specifically 15.5.15. Codemod handles most of the breaking-API migration automatically.
2. Key API migrations the codemod handles:
   - `cookies()`, `headers()`, `draftMode()` — become `async` (return `Promise`)
   - `params`, `searchParams` in `page.tsx` / `layout.tsx` — become `Promise`
3. Bump `eslint-config-next` in lockstep (14 → 15.5.15 to match).
4. Run `pnpm install` to refresh lockfile.
5. Fix anything the codemod missed: `getSession()`, `supabase-server.ts` (reads cookies, highest risk), any route handlers using cookies, server actions that read headers.
6. Run typecheck + full vitest suite.
7. Smoke-test the production build locally (`pnpm build`).

## Files to Change
- `apps/thriving-mobile/package.json` — next 14 → ^15.5.15, eslint-config-next 14 → ^15.5.15
- `package.json` (root) — add `pnpm.overrides` pinning `picomatch` and `flatted` to patched versions (closes the remaining transitive CVEs after Next upgrade)
- `pnpm-lock.yaml` — regenerated

No source-code migration was needed — the codebase was already Next 15-compatible:
- All `cookies()` calls already used `await` (Next 15 async form)
- No `headers()`, `draftMode()`, or dynamic route `params` usages in `app/` to migrate

## New Files
- `plans/nick-next-15-upgrade.md` — this plan

## Scope
medium-large (pnpm-lock + ~5-15 files — depends on how many places use the now-async APIs)

## PRE-PLAN PUSHBACK
PUSHBACK-PREPLAN: CLEAR-nick/next-15-upgrade

No concerns. Next 15.5.15 is the patched version; supports React 18 (no React upgrade needed). @sentry/nextjs@10 already supports Next 15. Codemod is Vercel's official migration tool.

## Open PRs Addressed
None open.

## COUNCIL PLAN REVIEW
RESULT: SKIPPED-LOCAL-ADVISORY

## PUSHBACK RESOLVED
PUSHBACK-RESOLVED: N/A

## HUMAN APPROVAL
STATUS: CONFIRMED

Nick said "continue" with Next upgrade as the logical next loose-end cleanup.

## POST-BUILD PUSHBACK
PUSHBACK-POSTBUILD: CLEAR-nick/next-15-upgrade

Typecheck clean, 43/43 tests pass, local `next build` succeeds, audit went from 6 high → 0 high. No concerns surfaced.

## COUNCIL CODE REVIEW
RESULT: SKIPPED-LOCAL-ADVISORY

## RETROSPECTIVE
RETROSPECTIVE: PENDING
