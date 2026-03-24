# Plan: PWA update notification banner

## TYPE
FEATURE

## Task
Add a "New version available" banner when the service worker detects a new deployment. Update button reloads the page. Small non-modal banner that doesn't interrupt the user's workflow.

## Approach
- Create a minimal service worker (public/sw.js) that caches nothing but enables the update lifecycle
- Register the service worker in a new hook (use-sw-update.ts) that detects the "waiting" state
- Create an UpdateBanner component — small fixed banner with "New version available" + Update button
- Render UpdateBanner in providers.tsx so it's available on every page
- Update button calls skipWaiting on the waiting SW, then reloads on controllerchange

## New Files
- `apps/thriving-mobile/public/sw.js` — minimal service worker (install + activate, no caching)
- `apps/thriving-mobile/src/hooks/use-sw-update.ts` — registers SW, detects waiting update
- `apps/thriving-mobile/src/components/UpdateBanner.tsx` — non-modal banner with Update button

## Files to Change
- `apps/thriving-mobile/src/app/providers.tsx` — render UpdateBanner

## Scope
small (3 new, 1 modified = 4 files)

## STATUS: COMPLETED
