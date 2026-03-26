# Plan: Fix PWA Session/Caching — Stale Data on Resume + Wrong Account

## TYPE
FEATURE

## Task
Erin and Liz see stale data, wrong-account data, and empty screens when returning to the PWA after inactivity. The app doesn't refetch data when it resumes from the background, and switching accounts doesn't clear the TanStack Query cache.

## Approach

**Fix 1 — Detect PWA resume, invalidate all cached data:**
Create a `use-app-focus.ts` hook that listens for `visibilitychange` and `pageshow` events. When the app has been hidden for more than 60 seconds and becomes visible again, call `queryClient.invalidateQueries()` to force all mounted queries to refetch fresh data from Supabase. This is more reliable than TanStack Query's built-in `focusManager` in iOS/Android PWA standalone mode.

**Fix 2 — Make TanStack Query more aggressive about freshness:**
Set `refetchOnWindowFocus: 'always'` and `refetchOnReconnect: 'always'` in the QueryClient defaults. This means every focus/reconnect event triggers a refetch, even if data is within the 60s staleTime window. Belt-and-suspenders with the custom hook.

**Fix 3 — Clear query cache on account switch:**
In `ChooseAccountContent.tsx`, call `queryClient.clear()` before navigating to `/today` after switching accounts. This wipes all cached data so the new account's data is fetched fresh. Query keys don't include the user ID, so without this, old account data persists.

**Fix 4 — Service worker network-first for API calls:**
Add a `fetch` event handler to `sw.js` that forces network-only for Supabase requests and POST requests (server actions). Static assets fall through to normal browser behavior. Defense-in-depth against any cache layer serving stale API responses.

## Files to Change
- `apps/thriving-mobile/src/app/providers.tsx` — add `refetchOnWindowFocus: 'always'`, `refetchOnReconnect: 'always'`, mount `AppFocusGuard`
- `apps/thriving-mobile/src/components/ChooseAccountContent.tsx` — add `useQueryClient()`, call `queryClient.clear()` before navigation on both account switch paths
- `apps/thriving-mobile/public/sw.js` — add `fetch` event listener with network-only for API/Supabase requests

## New Files
- `apps/thriving-mobile/src/hooks/use-app-focus.ts` — custom hook: detects PWA resume via `visibilitychange` + `pageshow`, invalidates all query caches after 60s+ inactivity

## Scope
small

## Pushback
None — proceeding as specified. This is a high-friction bug affecting 2 of 3 daily users.

## Lessons Addressed
- **No console.log in production:** Will use `reportError` from `src/lib/report-error.ts` if error handling is needed in the new hook.
- **Never tell Nick to test until CI is confirmed green:** Will monitor CI before reporting ready-to-test.
- **Arrow wrappers for TanStack Query server actions:** All existing queryFn patterns already use arrow wrappers — will maintain this pattern.

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #175

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
