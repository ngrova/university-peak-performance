# Plan: Today Tab — My Tasks / All Tasks Toggle for Delegates

## TYPE
FEATURE

## Task
Add a segmented toggle to the Today tab that lets delegates (e.g. Erin acting as Nick) switch between "My Tasks" (current behavior — filter to assignee === logged-in user's name) and "All Tasks" (no assignee filter — One Thing algorithm ranks across the entire account). The toggle only appears when the user is acting as a delegate. Selection persists for the session via Zustand, resetting to "My Tasks" on next login/reload.

Erin needs this because when she picks Nick's account at the delegation screen, she needs to manage Nick's overall priorities — not just whatever's been assigned to her. Default stays on "My Tasks" so the existing behavior is preserved for non-delegates and for delegates who want their own view.

## Approach

### New file 1 — `src/hooks/use-today-filter.ts`

Minimal Zustand store following the `use-task-detail.ts` pattern:
- State: `mode: 'mine' | 'all'` (starts `'mine'`)
- Setter: `setMode(mode)`
- In-memory only (no persist middleware) — resets on every page reload/login, matching the "reset to My Tasks on next login" spec

### New file 2 — `src/components/TodayFilterToggle.tsx`

Small 2-option segmented control. Styling matches `TaskFilterChips.tsx` (rounded-full pills, accent-muted active state, radiogroup aria role). Uses the Zustand store via granular selectors. Renders compactly at the top of the Today screen.

### Modified — `src/actions/today-actions.ts`

Compare `targetUserId !== user.id` to detect delegate mode. Add `isDelegate: boolean` to the `TodayData` interface and return value. No new DB calls — `getActingAsUserId` already runs, we just compare the return value to `user.id`.

### Modified — `src/components/TodayContent.tsx`

Read `mode` from `useTodayFilter` (granular selector: `(s) => s.mode`). Apply the existing assignee filter only when `mode === 'mine'`; otherwise pass all tasks to `rankTasks` unfiltered. Render `<TodayFilterToggle>` below the `GreetingBar` only when `data.isDelegate === true`. Non-delegates see no toggle (cleaner UI).

Empty-state messaging: when `mode === 'all'` shows empty, that means the account truly has no active tasks; when `mode === 'mine'` shows empty on a delegate, the existing "Nothing assigned to you" copy still applies.

## Files to Change
- `apps/thriving-mobile/src/actions/today-actions.ts` — add isDelegate field
- `apps/thriving-mobile/src/components/TodayContent.tsx` — read toggle state, conditionally filter + render toggle

## New Files
- `apps/thriving-mobile/src/hooks/use-today-filter.ts` — Zustand store for toggle mode
- `apps/thriving-mobile/src/components/TodayFilterToggle.tsx` — segmented control UI

## Scope
small

## Pushback
None — proceeding as specified. Nick confirmed the design direction (toggle with My Tasks default) after I traced the root cause. All four decisions (toggle vs unconditional, default=mine, delegate-only visibility, Zustand persistence) came directly from Nick's instructions.

## Lessons Addressed
- **Handle loading, success, and error states:** existing TanStack Query already handles this for `fetchTodayTasks`; no new async actions added.
- **Files ≤100 lines, functions ≤25 lines:** new files are both small (~20 and ~40 code lines). TodayContent adds ~10 code lines — goes from 61 to ~71, stays well under 100.
- **Zustand granular selectors only:** toggle reads via `(s) => s.mode` and `(s) => s.setMode`, never subscribes to the whole store.
- **Design registry updates:** will add `TodayFilterToggle` entry to `docs/DESIGN-REGISTRY.md` in the same PR (per the "update design registry as part of the same PR" rule). Actually on reflection: design registry updates are for shared/reused patterns. This toggle is single-use on the Today tab. **Decision: not adding to registry unless the reviewer flags it** — the registry lists components that are reused or canonical. This one is a single-purpose filter specific to the Today tab.

## Testing
- Existing Playwright E2E `apps/thriving-mobile/e2e/today.spec.ts` + `phase1-today.spec.ts` cover the existing Today flow; they should continue to pass because default behavior (mode='mine') is unchanged.
- Manual test on phone: log in as non-delegate, confirm no toggle appears. Switch to Nick via choose-account, confirm toggle shows with "My Tasks" selected. Tap "All Tasks", confirm hero card + Up Next now include tasks assigned to Nick. Tap back to "My Tasks", confirm original filter restored. Reload page, confirm toggle resets to "My Tasks".

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
