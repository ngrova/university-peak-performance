# Plan: Make Today's One Thing Hero Card Tappable

## TYPE
FEATURE

## Task
Make the One Thing hero card on the Today tab tappable — tapping anywhere on the card (except the Mark Complete button) opens the `TaskDetailSheet` for that task, giving full inline editing access to all fields (title, assignee, priority, deadline, notes, etc.).

Erin and other users see the hero task and want to edit its fields without having to navigate away to the Tasks tab to find it. The sheet overlay is already mounted app-wide via `app/(app)/layout.tsx`, and the same "tap opens sheet" pattern is already in use on `UpNextSection.tsx:47`.

## Approach

### Single file — `src/components/TodayHero.tsx`

1. **Import `useTaskDetail`** and grab the `open` action via a granular selector: `const open = useTaskDetail((s) => s.open);` (same pattern as `UpNextSection.tsx:41`).

2. **Wire the outer card div to open the sheet on tap.** Add these props to the `rounded-2xl p-5` card div:
   - `onClick={() => open(task)}` — triggers the detail sheet
   - `role="button"` — semantic accessibility
   - `tabIndex={0}` — keyboard focusable
   - `onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(task); } }}` — keyboard activation
   - `cursor: 'pointer'` in the style block

3. **Stop event propagation on Mark Complete.** Change the button's onClick from `onClick={handleComplete}` to `onClick={(e) => { e.stopPropagation(); handleComplete(); }}` — prevents the card-level onClick from firing after the button handler.

That's it. No changes to the scoring algorithm, no changes to TodayContent, no changes to the sheet itself. The sheet already lives at `layout.tsx:43` and displays any task passed to `open()`.

## Files to Change
- `apps/thriving-mobile/src/components/TodayHero.tsx` — make card tappable, stop propagation on complete button

## New Files
None.

## Scope
small

## Pushback
None — proceeding as specified. This follows the existing "tap opens sheet" pattern used by UpNextSection. Nick explicitly scoped the fix to this one file.

## Lessons Addressed
- **Handle loading/success/error states:** Unchanged — the existing completeTask flow handles its own states, and the sheet open action is instant (Zustand).
- **Design registry:** No new shared components created. TaskDetailSheet is already listed as a canonical sheet.
- **Files ≤100 / functions ≤25:** TodayHero is currently 60 code lines, adds ~5 → ~65 total. The TodayHero function stays well under 25 code lines.

## Testing
- Existing Playwright E2E `apps/thriving-mobile/e2e/today.spec.ts` + `phase1-today.spec.ts` cover Today tab and One Thing rendering. They should continue to pass — adding onClick doesn't change visual output or the Mark Complete flow.
- Manual test on phone: tap the hero card anywhere (title, context line, chip row, "Why this?" box) — TaskDetailSheet should open. Tap "Mark Complete" — task should complete and sheet should NOT open. Edit a field in the sheet — save works, invalidation from PR #189 reflects the change in the hero card when sheet closes.

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #190

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
