# Plan: Fix Inline Goal Creation in Capture Flow

## TYPE
FEATURE

## Task
Erin reports: tap "+ New goal" → fill name → select pillar → tap Create → glitches back to capture screen without saving. The goal is not created (from the user's perspective) and the task is lost. Root cause: the goal IS created in the DB, but the GoalPicker never reloads to show it because `goalPickerRef` was never wired to the component. Additionally, goalId is never cleared after task submission.

## Root Cause (with evidence)
`goalPickerRef` is created at CapturePageContent.tsx:38 but never passed as a prop — GoalPicker (lines 74-76) receives `value`, `onChange`, `onGoalsLoaded`, `onNewGoal` but no `ref`. GoalPicker is a plain function component (not forwardRef), so even if a ref were passed, it would be ignored. Result: `goalPickerRef.current` is always `null`, and `goalPickerRef.current?.reload()` at line 58 silently no-ops via optional chaining.

Secondary: CaptureFormFields.tsx:55 clears title, priority, deadline, assignee, notes — but omits `setGoalId('')`.

## Approach
1. **Wire GoalPicker ref:** Wrap GoalPicker with `forwardRef` + `useImperativeHandle` to expose its existing `reload()` method. Pass `ref={goalPickerRef}` from CapturePageContent. This was the original intent — the ref was created but never connected.
2. **Clear goalId on submit:** Add `setGoalId('')` to the field-clearing logic in `useCaptureForm.handleAdd()` so the goal doesn't persist across submissions.

After fix: inline goal creation → goal appears in picker → task saves under new goal → form clears for next entry.

## Files to Change
- `apps/thriving-mobile/src/components/GoalPicker.tsx` — wrap with forwardRef, expose reload via useImperativeHandle
- `apps/thriving-mobile/src/components/CapturePageContent.tsx` — pass ref={goalPickerRef} to GoalPicker
- `apps/thriving-mobile/src/components/CaptureFormFields.tsx` — add setGoalId('') to the clear logic in handleAdd
- `apps/thriving-mobile/e2e/phase1-capture.spec.ts` — add E2E test: tap + New goal → fill → create → verify goal appears in picker → save task

## New Files
None

## Scope
small

## Pushback
None — proceeding as specified. Clear bugs with confirmed root causes and minimal fixes.

## Lessons Addressed
- "Handle loading, success, and error states on every user-facing action" — the inline goal creation already handles these; the bug is that the parent doesn't react to the success state correctly.
- "Never guess and ship" — root cause confirmed by reading every file in the chain: InlineGoalCreate → createGoalAction → handleGoalCreated → goalPickerRef (null) → GoalPicker (never reloads).

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
