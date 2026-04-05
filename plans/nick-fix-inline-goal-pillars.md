# Plan: Fix Empty Pillars List in Inline Goal Create

## TYPE
FEATURE

## Task
Fix the bug where opening the inline goal create form during capture sometimes shows an empty pillar list with no way to proceed. Erin hits this intermittently on mobile, has to exit capture, and starts over. Root cause traced in the investigation report on 2026-04-05: `InlineGoalCreate.tsx:39-41` fires `fetchGoalsForPicker()` with no `.catch()`, no loading state, no error UI. Transient fetch failures silently leave `pillars` as `[]`.

## Approach

### Fix 1 — `src/actions/goal-actions.ts` (defensive server action)

Wrap `fetchGoalsForPicker` body in try/catch. On success, return `{ pillars, goals }` as today. On failure, `reportError` and return `{ pillars: [], goals: [], error: 'message' }`. Add an optional `error?: string` field to the return type.

This is additive and backward-compatible: the two other callers (`GoalPicker.tsx:46`, `GoalEditSheet.tsx:63`) ignore the new field — they already handle empty arrays fine, and `GoalEditSheet` already has its own `.catch()` hiding behavior. No caller changes needed there.

### Fix 2 — `src/components/InlineGoalCreate.tsx` (loading + error + retry UI)

Add two new state variables:
- `pillarsLoading: boolean` — starts `true`, becomes `false` on fetch resolve (success or failure)
- `pillarsError: string | null` — set when the server action returns `{ error }` or the promise rejects

Restructure the `useEffect` into a named async loader (`loadPillars`) called on mount AND on retry button click. Add `.catch()` for promise rejection (defense-in-depth in case Fix 1 misses something).

Replace the pillar chip row with three branches:
- `pillarsLoading`: show "Loading pillars…" skeleton text
- `pillarsError`: show error message + "Retry" button
- `pillars.length > 0`: show pillar chips (current behavior)

Disable the Create button while `pillarsLoading || pillarsError !== null || pillars.length === 0` — prevents the user from submitting without a valid pillar choice.

Extract the pillar chip row into a small inner component/helper to keep the main component's JSX readable and under the Sandi file-line limit.

## Files to Change
- `apps/thriving-mobile/src/actions/goal-actions.ts` — wrap body in try/catch, return optional error field
- `apps/thriving-mobile/src/components/InlineGoalCreate.tsx` — add loading/error states, retry button, disable Create until pillars loaded

## New Files
None.

## Scope
small

## Pushback
None — proceeding as specified. Fix scope matches Nick's instructions exactly (same two-file pattern as #4). Other callers of `fetchGoalsForPicker` are not in scope and don't need changes (they already handle empty arrays gracefully).

## Lessons Addressed
- **Handle loading, success, and error states on every user-facing action:** The bug is precisely a missing loading state + missing error state. Fix adds both.
- **Never guess and ship:** Root cause traced from code inspection — InlineGoalCreate.tsx:40 has no `.catch()`. Confirmed by Explore agent on 2026-04-05.
- **Error messages actionable:** "Couldn't load pillars — tap to retry" gives the user a specific next action.
- **Files ≤100 lines, functions ≤25 lines:** Current InlineGoalCreate.tsx is 91 lines. Adding loading/error branches will push it close to 100 — the plan extracts the chip row into an inner helper to stay under the limit.

## Testing
- Existing Playwright E2E `apps/thriving-mobile/e2e/phase1-capture.spec.ts` covers the happy path (inline goal creation → goal appears in picker → task saves). My changes preserve the happy path — pillarsLoading resolves quickly, chips render, user can pick and create.
- Manual test on phone: open capture, tap "+ New Goal", verify "Loading pillars…" briefly shows, then chips render. Toggle airplane mode, tap retry on a fresh open, confirm retry actually re-fetches.
- No new unit tests — testing React state transitions for loading/error UI is primarily covered by E2E flows.

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #187

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
