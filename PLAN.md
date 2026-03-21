# Plan: Assistant Delegation Model — PR 2 Application Layer

## TYPE
FEATURE

## Task
Wire up the delegation model in the mobile app so assistants can pick an account after login, see the owner's data, and know whose account they're viewing.

## Approach
- Create `getActingAsUserId()` helper: reads `acting_as` cookie, validates delegation, returns owner_id or falls back to auth.uid()
- Update 8 server action functions that pass `user.id` → swap to `targetUserId`
- Build `/choose-account` route: server component checks delegations, redirects if none, renders picker
- Add `DelegationBanner` to app layout: reads cookie, shows "Viewing Nick's account" with switch link
- Create seed-delegations script for Erin and Liz
- Two cookies: `acting_as` (owner UUID) and `acting_as_name` (display name for banner)

## Files to Change
- `apps/thriving-mobile/src/lib/get-acting-as.ts` — new helper
- `apps/thriving-mobile/src/actions/delegation-actions.ts` — new: selectAccount, clearActingAs
- `apps/thriving-mobile/src/actions/today-actions.ts` — targetUserId in 3 functions
- `apps/thriving-mobile/src/actions/task-actions.ts` — targetUserId in captureTask
- `apps/thriving-mobile/src/actions/goal-actions.ts` — targetUserId in fetchGoalsForPicker
- `apps/thriving-mobile/src/actions/goals-page-actions.ts` — targetUserId in fetchPillars
- `apps/thriving-mobile/src/actions/tasks-page-actions.ts` — targetUserId in fetchAllTasks
- `apps/thriving-mobile/src/actions/tree-actions.ts` — targetUserId in fetchTreeData
- `apps/thriving-mobile/src/app/(auth)/choose-account/page.tsx` — new server component
- `apps/thriving-mobile/src/components/ChooseAccountContent.tsx` — new client component
- `apps/thriving-mobile/src/components/DelegationBanner.tsx` — new server component
- `apps/thriving-mobile/src/app/(app)/layout.tsx` — add DelegationBanner
- `apps/thriving-mobile/src/app/(auth)/login/page.tsx` — redirect to /choose-account
- `apps/thriving-mobile/src/app/(auth)/signup/page.tsx` — redirect to /choose-account
- `apps/thriving/scripts/seed-delegations.ts` — new script
- `docs/DESIGN-REGISTRY.md` — add DelegationBanner + ChooseAccountContent entries

## Scope
large (16 files)

## STATUS: APPROVED
