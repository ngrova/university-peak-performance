# Plan: Convert capture to full-screen page

## TYPE
REDESIGN

## Task
Convert capture from a bottom sheet overlay to a dedicated full-screen page at /capture under a new (fullscreen) route group. Tab bar hidden. Back button to return (with /today fallback for direct URL access). "Task added" toast on success. + button on tab bar navigates to /capture instead of opening sheet.

## Approach
- Create `(fullscreen)` route group with layout: DelegationBanner + children, no tab bar, no bottom sheets
- Build CapturePageContent — same components as CaptureSheet, full-screen layout with back button and scrolling
- Add "Task added" toast (1.5s fade) after successful capture before clearing fields
- Change BottomTabBar center button from store call to Link href="/capture"
- Change TasksContent FAB button from store call to Link href="/capture"
- Remove CaptureSheet from (app) layout and delete the useCaptureSheet store
- Update 3 E2E test files: replace sheet-open with page navigation, Close with back, add toast/tab-bar assertions
- Back button uses router.back() with /today fallback if no history

## Files to Change
- `apps/thriving-mobile/src/components/BottomTabBar.tsx` — center button becomes Link to /capture
- `apps/thriving-mobile/src/components/TasksContent.tsx` — FAB button becomes Link to /capture
- `apps/thriving-mobile/src/app/(app)/layout.tsx` — remove CaptureSheet import/render
- `apps/thriving-mobile/e2e/phase1-capture.spec.ts` — navigate to /capture page, replace Close with back
- `apps/thriving-mobile/e2e/capture-upgrade.spec.ts` — update openCapture for page navigation
- `apps/thriving-mobile/e2e/capture-ai.spec.ts` — update openCapture for page navigation
- `docs/DESIGN-REGISTRY.md` — update CaptureSheet → CapturePageContent, add SuccessToast

## New Files
- `apps/thriving-mobile/src/app/(fullscreen)/layout.tsx` — authenticated layout without tab bar
- `apps/thriving-mobile/src/app/(fullscreen)/capture/page.tsx` — capture page Server Component
- `apps/thriving-mobile/src/components/CapturePageContent.tsx` — full-screen capture form
- `apps/thriving-mobile/src/components/SuccessToast.tsx` — brief "Task added" fade-out toast

## Files to Delete
- `apps/thriving-mobile/src/app/(app)/capture/page.tsx` — redirect stub, replaced by (fullscreen)/capture
- `apps/thriving-mobile/src/hooks/use-capture-sheet.ts` — sheet store, no longer needed
- `apps/thriving-mobile/src/components/CaptureSheet.tsx` — replaced by CapturePageContent

## Scope
large (7 files changed, 4 new files, 3 deleted)

## STATUS: COMPLETED
