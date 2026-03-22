# Design Registry

Last updated: Delegation Model (PR #99)

One source of truth for every shared UI pattern in thriving-mobile.
Agent 7 reads this at plan review (soft check) and code review (hard check).
Claude Code updates this whenever a PR adds or modifies shared components.

---

## Progress indicators

### ProgressRing
- **Canonical:** `src/components/ProgressRing.tsx`
- **Introduced:** Phase 4
- **Usage:** Circular SVG progress on tree nodes (pillar map, goal clusters)
- **Called by:** VertexNode, PillarMap, GoalClusters

### ProgressBar
- **Canonical:** `src/components/ProgressBar.tsx`
- **Introduced:** Phase 3
- **Usage:** Horizontal progress bar on pillar and goal cards
- **Called by:** PillarCard, GoalCard

> Both coexist — ProgressRing for tree visualization, ProgressBar for card lists.

## Navigation nodes

### VertexNode
- **Canonical:** `src/components/VertexNode.tsx`
- **Introduced:** Phase 4
- **Usage:** Circular header at top of every tree drill-down level
- **Called by:** PillarMap, GoalClusters, TaskChain

## Task display

### TaskSwipeRow
- **Canonical:** `src/components/TaskSwipeRow.tsx`
- **Introduced:** Phase 2
- **Usage:** Swipeable task row (right = complete, left = delete) for full inventory
- **Called by:** TaskGoalGroup, GoalDetail

### TaskRow
- **Canonical:** `src/components/TaskRow.tsx`
- **Introduced:** Phase 1
- **Usage:** Lightweight task row (swipe right = complete) for dashboard sections
- **Called by:** QueueList, OverdueList

> TaskRow for curated sections (Today); TaskSwipeRow for full inventory (Tasks, Goals).

## Bottom sheets

### TaskDetailSheet
- **Canonical:** `src/components/TaskDetailSheet.tsx`
- **Introduced:** Phase 1, priority/assignee/failure-cost added in Task Detail Fields
- **Usage:** App-wide task detail overlay with inline editing — title, priority chips, assignee pills, failure cost, deadline, notes (auto-save on blur/change)
- **Called by:** layout.tsx (always mounted)

### CapturePageContent
- **Canonical:** `src/components/CapturePageContent.tsx`
- **Introduced:** Capture Fullscreen (replaces CaptureSheet)
- **Usage:** Full-screen capture page — voice recording, camera, AI processing, task form, success toast. Lives at /capture under (fullscreen) route group.
- **Called by:** app/(fullscreen)/capture/page.tsx

### SuccessToast
- **Canonical:** `src/components/SuccessToast.tsx`
- **Introduced:** Capture Fullscreen
- **Usage:** Brief green "Task added" toast that fades after 1.5s. Confirms successful save during rapid capture.
- **Called by:** CapturePageContent

### CaptureMediaSection
- **Canonical:** `src/components/CaptureMediaSection.tsx`
- **Introduced:** Capture Layer 3 (PR #104)
- **Usage:** Voice/photo capture buttons, voice note cards, photo thumbnails, "Process with AI" button
- **Called by:** CapturePageContent

### VoiceNoteCard
- **Canonical:** `src/components/VoiceNoteCard.tsx`
- **Introduced:** Capture Layer 3 (PR #104)
- **Usage:** Compact card for one voice recording — play/stop, decorative waveform, duration, remove button
- **Called by:** CaptureMediaSection

### PhotoCapture
- **Canonical:** `src/components/PhotoCapture.tsx`
- **Introduced:** Capture Layer 3 (PR #104)
- **Usage:** Horizontal scrolling row of captured photo thumbnails with remove buttons
- **Called by:** CaptureMediaSection

### GoalEditSheet
- **Canonical:** `src/components/GoalEditSheet.tsx`
- **Introduced:** Goal CRUD (PR #101)
- **Usage:** App-wide goal detail overlay with inline editing (auto-save on blur), pillar picker, archive
- **Called by:** layout.tsx (always mounted), controlled by useGoalDetail store

### PillarEditSheet
- **Canonical:** `src/components/PillarEditSheet.tsx`
- **Introduced:** Pillar CRUD (PR #102)
- **Usage:** App-wide pillar detail overlay with inline editing (auto-save on blur), color picker, reorder, archive
- **Called by:** layout.tsx (always mounted), controlled by usePillarDetail store

## Breadcrumbs

### Breadcrumbs
- **Canonical:** `src/components/Breadcrumbs.tsx`
- **Introduced:** Phase 3, shared type extracted Phase 4
- **Usage:** Navigation trail in Goals and Tree tabs
- **Called by:** GoalsContent, TreeContent

### BreadcrumbChip
- **Canonical:** `src/components/BreadcrumbChip.tsx`
- **Introduced:** Phase 3
- **Usage:** Single breadcrumb item (tappable link or static label)
- **Called by:** Breadcrumbs

## Cards

### PillarCard
- **Canonical:** `src/components/PillarCard.tsx`
- **Introduced:** Phase 3, edit icon added in Pillar CRUD
- **Usage:** Tappable pillar card with progress bar, goal count, and edit icon (opens PillarEditSheet)
- **Called by:** PillarList

### GoalCard
- **Canonical:** `src/components/GoalCard.tsx`
- **Introduced:** Phase 3, edit icon added in Goal CRUD
- **Usage:** Tappable goal card with progress bar, task count, and edit icon (opens GoalEditSheet)
- **Called by:** PillarDetail

### OneThingCard
- **Canonical:** `src/components/OneThingCard.tsx`
- **Introduced:** Phase 1
- **Usage:** Hero card for the user's #1 focus task on Today screen
- **Called by:** TodayContent

## Task chain nodes

### TaskChainNode
- **Canonical:** `src/components/TaskChainNode.tsx`
- **Introduced:** Phase 4
- **Usage:** Single task in vertical chain (completed/current/blocked states)
- **Called by:** TaskChain

### ForkNode
- **Canonical:** `src/components/ForkNode.tsx`
- **Introduced:** Phase 4
- **Usage:** Fork point showing parallel tracks in task chain
- **Called by:** TaskChain

## Action controls

### TaskActions
- **Canonical:** `src/components/TaskActions.tsx`
- **Introduced:** Phase 1
- **Usage:** Complete/Block buttons in task detail sheet
- **Called by:** TaskDetailSheet

### DeleteConfirm
- **Canonical:** `src/components/DeleteConfirm.tsx`
- **Introduced:** Phase 1
- **Usage:** Inline confirmation row for destructive actions (swipe-to-delete)
- **Called by:** TaskSwipeRow

### AddGoalButton
- **Canonical:** `src/components/AddGoalButton.tsx`
- **Introduced:** Goal CRUD (PR #101)
- **Usage:** Inline add-goal button with text input, saves on Enter/blur, disables during save
- **Called by:** PillarDetail

### AddPillarButton
- **Canonical:** `src/components/AddPillarButton.tsx`
- **Introduced:** Pillar CRUD (PR #102)
- **Usage:** Inline add-pillar button with text input, saves on Enter/blur, disables during save
- **Called by:** PillarList

## Task field components

### PriorityChips
- **Canonical:** `src/components/PriorityChips.tsx`
- **Introduced:** Capture Upgrade (PR #103)
- **Usage:** P1-P4 color-coded pill selector for task priority (single-select, toggle off)
- **Called by:** CaptureSheet, TaskDetailSheet

### DeadlineChip
- **Canonical:** `src/components/DeadlineChip.tsx`
- **Introduced:** Capture Upgrade (PR #103)
- **Usage:** Tappable chip wrapping native date picker, shows formatted date or "No deadline"
- **Called by:** CaptureSheet

### AssigneeChips
- **Canonical:** `src/components/AssigneeChips.tsx`
- **Introduced:** Capture Upgrade (PR #103)
- **Usage:** Nick/Erin/Liz tappable pill selector for task assignee (single-select, toggle off)
- **Called by:** CaptureSheet, TaskDetailSheet

### FailureCostChips
- **Canonical:** `src/components/FailureCostChips.tsx`
- **Introduced:** Task Detail Fields (PR #112)
- **Usage:** Low/medium/high/critical pill selector for task failure cost (single-select, toggle off)
- **Called by:** TaskDetailSheet

## Filter & search

### TaskFilterChips
- **Canonical:** `src/components/TaskFilterChips.tsx`
- **Introduced:** Phase 2
- **Usage:** Status filter chips (All/Active/Blocked/Completed)
- **Called by:** TasksContent

### TaskSearchBar
- **Canonical:** `src/components/TaskSearchBar.tsx`
- **Introduced:** Phase 2
- **Usage:** Search input for filtering tasks by title
- **Called by:** TasksContent

### GoalPicker
- **Canonical:** `src/components/GoalPicker.tsx`
- **Introduced:** Phase 1
- **Usage:** Goal selection dropdown grouped by pillar
- **Called by:** CaptureSheet

## App shell

### BottomTabBar
- **Canonical:** `src/components/BottomTabBar.tsx`
- **Introduced:** Phase 0
- **Usage:** Five-tab navigation bar (Today/Tasks/Capture/Goals/Tree)
- **Called by:** layout.tsx

### InputField
- **Canonical:** `src/components/InputField.tsx`
- **Introduced:** Phase 0
- **Usage:** Styled text input for auth forms (login/signup)
- **Called by:** login/page.tsx, signup/page.tsx

### GreetingBar
- **Canonical:** `src/components/GreetingBar.tsx`
- **Introduced:** Phase 1
- **Usage:** Personalized greeting + date on Today screen
- **Called by:** TodayContent

## Delegation

### DelegationBanner
- **Canonical:** `src/components/DelegationBanner.tsx`
- **Introduced:** Delegation Model
- **Usage:** Persistent banner showing "Viewing X's account" with switch link when acting as assistant
- **Called by:** layout.tsx

### ChooseAccountContent
- **Canonical:** `src/components/ChooseAccountContent.tsx`
- **Introduced:** Delegation Model
- **Usage:** Account picker shown after login when user has delegations
- **Called by:** choose-account/page.tsx

---

## Deprecated patterns

None currently. Both ProgressRing and ProgressBar are active for different contexts.

> When a pattern is replaced, move it here with the phase it was deprecated and what replaced it.
