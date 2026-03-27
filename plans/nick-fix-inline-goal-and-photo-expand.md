# Plan: Fix Inline Goal Creation + Photo Expand Bugs

## TYPE
FEATURE

## Task
Fix two user-reported bugs:
1. Erin (March 26): Inline goal creation in capture screen fails — goal doesn't save, task capture breaks
2. Liz (March 25-26): Photo attachments in task detail don't open when tapped — reported twice

## Approach

### Bug 1: Inline Goal Creation
Root cause: Multiple defensive gaps in the inline creation → capture flow:
- No try/catch around the server action call in handleCreate — transport errors crash silently
- After goal creation, the GoalPicker select doesn't have the new goal in its options (async reload hasn't completed), so the select shows "No goal" visually. This may cause the browser to reset the controlled value on some mobile browsers.
- Fix: Return full goal info from the server action. Add an `addGoal` method to GoalPickerHandle that synchronously inserts the new goal into the local options list. Call it BEFORE setting goalId so the select always has a matching option. Add try/catch in handleCreate.

### Bug 2: Photo Attachment Not Opening
Root cause: The `sheet-enter` CSS animation applies `transform: translateY(0)` via `animation-fill-mode: forwards`. A CSS transform on a parent creates a containing block that traps `position: fixed` descendants. The expanded photo modal (fixed, z-[60]) renders INSIDE the SheetBody instead of the viewport, and gets clipped by `overflow-y-auto` + `max-h-[80vh]`.
- Fix: Use `createPortal(document.body)` to render the expanded modal outside the sheet's transform context. Also wrap the img in a button for reliable mobile touch events.

## Files to Change
- apps/thriving-mobile/src/actions/goal-crud-actions.ts — return title + pillarId alongside goalId
- apps/thriving-mobile/src/components/InlineGoalCreate.tsx — pass full goal info to onCreated, add try/catch
- apps/thriving-mobile/src/components/CapturePageContent.tsx — update handleGoalCreated to add goal to picker synchronously
- apps/thriving-mobile/src/components/GoalPicker.tsx — add addGoal to imperative handle
- apps/thriving-mobile/src/components/SavedPhoto.tsx — use createPortal for modal, button wrapper for img

## New Files
None

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
- "Never use console.log in production" — not applicable (no logging added)
- "Handle loading, success, and error states" — Bug 1 fix adds proper error handling for transport errors

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #180

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
