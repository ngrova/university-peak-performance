# MOBILE-FIRST REBUILD SPEC — Thriving App
### Strategic decisions made by Nick + Claude Opus, March 18, 2026
### Hand this to Claude Code at the start of each phase.

---

## WHAT THIS IS

Nick and his strategic reviewer (Claude Opus) made every architectural and design decision in this document through a dedicated strategy session. Claude Code's job is to **execute these decisions faithfully**, not re-debate them. If something in this spec conflicts with existing patterns in the codebase, follow the spec — it represents intentional departures from the current approach.

---

## THE DECISION: Fresh App in the Monorepo

Create `apps/thriving-mobile/` as a new app in the Turborepo monorepo. Do NOT modify the existing `apps/thriving/` codebase.

**Why:** The existing app is a desktop-first layout. Mobile-first is a fundamentally different interaction model — touch targets, gesture zones, viewport management, scroll behavior, animation. Retrofitting is slower and riskier than building fresh.

**What carries over:** The Supabase backend (schema, RLS policies, migrations) and any shared types/utilities from `packages/`. The existing desktop app continues running at its current Netlify URL as the fallback while the mobile app develops.

**What does NOT carry over:** UI components, layout logic, page structure, CSS/styling approach. These are rebuilt from scratch for mobile.

---

## NAVIGATION: Bottom Tab Bar (5 Slots)

A fixed bottom tab bar with 5 positions. No hamburger menu. No drawer. Every core workflow is one thumb-tap away.

### Tab Layout

| Position | Tab | Icon (Lucide) | Purpose |
|----------|-----|---------------|---------|
| 1 (left) | Today | `sun` | Daily driver — what to do right now |
| 2 | Tasks | `list-checks` | Full task inventory |
| 3 (center) | + Capture | `plus-circle` | Quick-add FAB button (larger, accent-colored) |
| 4 | Goals | `target` | Life Pillars → Goals → Tasks drill-down |
| 5 (right) | Tree | `git-branch` | Domino Tree with zone navigation |

**Icon treatment:** Outline when inactive, filled when active. 24px icons. Active tab also shows the label text below the icon. Inactive tabs show icon only (saves space).

**The center Capture button** is visually distinct — raised, accent-colored, larger than the other tab icons. Tapping it opens a bottom sheet (not a new page), so the user never loses context.

---

## SCREENS AND FLOWS

### Screen 1: Today (Default/Home)

The screen you see when you open the app. Answers: "What should I do right now?"

**Layout (top to bottom):**
- Greeting bar: "Good morning, Nick" with date. Minimal, one line.
- **One Thing hero card:** Large, prominent, distinct background. Shows the pinned One Thing task with its parent goal. Tap to open task detail sheet. If nothing is pinned, show an empty state prompting the user to pin something.
- **Queue section:** "Up Next" label, then a compact vertical list of queued tasks. Each row: task name, parent goal pill, deadline indicator if applicable. Swipe right to complete. Tap to open task detail sheet.
- **Overdue/Due Today section:** Only appears if items exist. Red accent. Compact list, same interaction as queue.

**No scrolling required for a typical day.** If the user has 3-5 queued items and a One Thing, it all fits on one screen. If they have more, it scrolls naturally.

### Screen 2: Tasks

Full task list. The "find and manage" screen. Answers: "Where is that task?" and "Let me process my backlog."

**Layout:**
- Search bar (sticky top, tap to expand with keyboard).
- Filter chips below search: All, Active, Blocked, Completed. Horizontally scrollable.
- Task list: Grouped by Goal (collapsible sections). Each row: checkbox, task name, deadline badge, blocker icon if blocked. Swipe right to complete. Swipe left to reveal actions (edit, delete, move to queue).
- Tap any task → task detail bottom sheet.
- Floating action button (bottom right, above tab bar) for quick add — same capture sheet as center tab button.

### Screen 3: Capture (Bottom Sheet, not a full screen)

Opens as a half-screen bottom sheet from the center tab button or any FAB.

**Layout:**
- Text input (auto-focused, keyboard appears immediately).
- Below input, a single row of optional quick-assign buttons: Goal picker, Deadline picker, Camera (for photo attachment), Priority.
- "Add" button. One tap to save with just a title. Everything else is optional.
- After saving, the sheet stays open with the input cleared — rapid capture mode. Swipe down to dismiss.

**Photo/document attachment flow:** Tap camera icon → native camera or photo picker → photo preview → optionally attach to multiple tasks/dominoes via a multi-select list → save. Photos stored in Supabase Storage. Metadata in `task_attachments` table with `task_attachment_links` junction table for multi-attach.

### Screen 4: Goals

The "zoom out" screen. Answers: "Am I working on the right things?"

**Layout:**
- Life Pillars as large tappable cards in a vertical list. Each card shows: Pillar name, number of active goals, a subtle progress indicator (tasks completed / total across all goals in this pillar).
- Tap a Pillar → expands inline (accordion style) or navigates to a Pillar detail screen showing its Goals as cards.
- Tap a Goal → navigates to a Goal detail screen showing its tasks as a compact list.
- This creates a natural drill-down: Pillars → Goals → Tasks. Breadcrumbs at top: "Health > Fitness Goals". Tap any breadcrumb to jump back.

### Screen 5: Domino Tree (Zone-Based Navigation)

The most complex screen. See dedicated section below.

### Shared Component: Task Detail Bottom Sheet

When the user taps ANY task anywhere in the app, this sheet slides up from the bottom (half-screen by default, draggable to full-screen).

**Contents:**
- Task title (editable inline).
- Status row: Complete button, Blocker toggle, Priority indicator.
- Parent Goal (tappable, navigates to goal).
- Deadline (tappable, opens date picker).
- Notes (expandable text area).
- Attachments section: thumbnail grid of photos/documents. Tap to preview full-screen. "Add attachment" button.
- Domino connections: shows what this task depends on and what depends on it (compact, tappable links).
- Danger zone: Delete task (with confirmation).

Swipe down to dismiss. Changes auto-save.

---

## DOMINO TREE: ZONE-BASED NAVIGATION

### The Problem

The Domino Tree is a large dependency graph. On mobile, showing the full map creates a "this is overwhelming" reaction. Pinch-to-zoom on a massive graph is a poor mobile experience.

### The Solution: Never Show the Whole Map

The tree uses hierarchical zone navigation — like Google Maps. You never see every street at once. You see the zoom level appropriate to what you're trying to understand.

### Zone Levels

**Level 1 — Pillar Map (the "country view")**
- The default Tree tab screen.
- Shows Life Pillars as large nodes/cards. Each shows: Pillar name, count of goals, count of active tasks, a health/progress indicator.
- All pillars fit on one phone screen with no scrolling (typically 4-6 pillars).
- Tap a pillar → zooms to Level 2.
- Answers: "Which area of my life should I focus on?"

**Level 2 — Goal Clusters (the "city view")**
- Shows all Goals within the selected Pillar as nodes.
- Each Goal node shows: goal name, count of child tasks, a mini progress ring.
- First layer of tasks visible as small connected dots/chips around each goal (showing quantity and status, not full detail).
- Typically 3-8 goals per pillar — fits on one screen or a short scroll.
- Tap a Goal → zooms to Level 3.
- Answers: "What are my active goals here and how much is happening under each?"

**Level 3 — Task Chain (the "street view")**
- Shows the full domino chain for ONE goal.
- Vertical layout: small actionable tasks at the top, cascading downward to the goal at the bottom.
- Dependency lines (bezier curves) connect tasks. Blocked tasks are visually dimmed. Completed tasks show a subtle checkmark.
- Typically 5-20 nodes — manageable on one screen or a single scroll.
- Tap any task → opens the standard task detail bottom sheet.
- Answers: "What's the path from here to this goal?"

### Zone Navigation UX

- **Breadcrumbs** at top of screen: `Tree > Health > Run a Marathon`. Tap any breadcrumb to jump to that level.
- **Back gesture:** Swipe right (iOS-native feel) or tap breadcrumb to go up one level.
- **Transition animation:** The tapped node expands to fill the screen as its children appear. This creates spatial memory — you feel like you're drilling into the map.
- **No pinch-to-zoom** on Levels 1 and 2 (they fit the screen). Level 3 can support pinch-to-zoom if the task chain is large, because at that point you're navigating a scoped map, not the entire tree.

### Optional: Birds-Eye Overview

Accessible from Level 1 via a small "overview" toggle/button. Shows the entire tree as a minimap: tiny dots colored by pillar, clusters visible. Not interactive at the task level — it's a vibes check. Tap a cluster → jumps to Level 2 for that pillar. Think of the zoomed-out satellite view in Google Maps. Build this LAST — it's a nice-to-have, not essential.

---

## VISUAL DESIGN LANGUAGE

### Aesthetic Direction: Premium Dark

This app should feel like Whoop, Arc Browser, or Linear — premium, confident, space-efficient. Not playful, not colorful, not "developer tool." The word to anchor on: **refined.**

### Color

- **Background:** Near-black. `#0A0A0F` or similar deep blue-black.
- **Surface (cards, sheets):** `#1A1A2E` — slightly lighter, with enough contrast to distinguish layers.
- **Text primary:** `#F0F0F5` — near-white, not pure white (easier on eyes).
- **Text secondary:** `#8888A0` — muted for labels and metadata.
- **Accent:** Warm amber/gold. `#E8A838` or similar. Used sparingly — active tab, CTAs, completion states, progress indicators. This differentiates from the sea of blue productivity apps and signals "achievement."
- **Danger/overdue:** `#E84848` — warm red, not neon.
- **Success/complete:** `#38C878` — green for completed items.
- **Blocked:** `#6868A0` — muted purple-gray.

Use CSS variables for all colors. The entire palette should be changeable from one file.

### Typography

- **Font family:** System font stack. `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif`. On iOS, this renders as SF Pro — Apple's native font. No custom font downloads, instant rendering, feels native.
- **Weights:** Regular (400) for body, Semibold (600) for labels and section headers, Bold (700) for screen titles only.
- **Sizes (use rem, base 16px):**
  - Screen title: 1.5rem (24px)
  - Section header: 1.125rem (18px)
  - Body / task names: 1rem (16px)
  - Labels / metadata: 0.8125rem (13px)
  - Tiny / badges: 0.6875rem (11px)
- **No more than 3 sizes on any single screen.** The hierarchy comes from weight and size combined, not from color or decoration.

### Spacing

- **Base unit:** 8px grid. Everything aligns to multiples of 8.
- **Card internal padding:** 16px.
- **Gap between cards:** 12px.
- **Section spacing:** 24px.
- **Screen horizontal padding:** 20px (16px on very small screens).
- **Tab bar height:** 56px + safe area inset (for iPhone home indicator).
- **Touch targets:** Minimum 44x44px on all interactive elements (Apple HIG guideline).

### Motion and Feedback

- **Sheet presentations:** Spring animation (fast attack, slight overshoot, settle). Not linear ease. Use CSS `cubic-bezier(0.32, 0.72, 0, 1)` or similar spring curve.
- **Tab transitions:** Crossfade, 200ms. No sliding — tabs are peers, not a stack.
- **Task completion:** Checkbox fills with accent color + subtle scale pulse. The row should animate out of the list smoothly (not just disappear).
- **Zone drill-down (Tree):** The tapped node scales up and fades to become the new screen's header. Children animate in with a staggered fade. 300ms total.
- **Maximum animation duration:** 300ms for UI transitions. 500ms for celebratory moments (task completion cascade).
- **Haptic feedback:** Use `navigator.vibrate()` for task completion if available. Single short pulse.

### Iconography

- **Icon set:** Lucide React. Already in the stack. Consistent, clean, 24px.
- **Style:** Outline (strokeWidth 1.5) for inactive/default. Filled variant for active tab.
- **Never mix icon families.** If Lucide doesn't have something, find the closest Lucide equivalent.

### General Rules

- **No borders on cards.** Use elevation/shadow or background color difference for separation.
- **Rounded corners:** 12px on cards, 8px on buttons and inputs, 20px (fully round) on pills and badges.
- **No gradients** except very subtle ones on the One Thing hero card.
- **Opacity for hierarchy:** Use opacity (0.5-0.7) to de-emphasize secondary information rather than different colors.

---

## PWA CONFIGURATION

The app must feel native when added to the iPhone home screen.

- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">` — prevents pinch-to-zoom, covers notch area.
- `<meta name="apple-mobile-web-app-capable" content="yes">` — fullscreen on iOS.
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` — status bar blends with dark background.
- `<meta name="theme-color" content="#0A0A0F">` — matches app background.
- PWA manifest with proper icons (192px, 512px).
- `display: standalone` in manifest.
- Safe area insets: Use `env(safe-area-inset-bottom)` on the tab bar for iPhone home indicator.

---

## WHAT THE SUPABASE BACKEND ALREADY HAS

Claude Code: before building any screen, read the existing Supabase schema and types in the codebase. The following tables/concepts already exist and MUST be reused (not recreated):

- Tasks (with status, priority, deadlines, blocker flags)
- Goals
- Life Pillars
- Task hierarchy / domino dependencies
- One Thing pinning
- Queue ordering
- User authentication (Supabase Auth)
- RLS policies (row-level security per user)

The photo/document attachment feature (`task_attachments` table, `task_attachment_links` junction table, Supabase Storage bucket) may or may not exist yet. Check first. If it doesn't exist, it will be built in Phase 5.

---

## BUILD PHASES

Execute these in order. Each phase produces a deployable, usable app. Never break what's already working.

### Phase 0 — Scaffold
**Goal:** Empty shell that feels like a native app on the iPhone home screen.

- Create `apps/thriving-mobile/` in the monorepo.
- Next.js App Router, React, TypeScript strict, Tailwind CSS, shadcn/ui.
- Wire shared Supabase client from `packages/`.
- All PWA meta tags and manifest configured.
- Bottom tab bar with 5 tabs, each showing a placeholder screen with the tab name.
- Dark theme CSS variables set up.
- Auth flow: login/signup that reuses existing Supabase Auth.
- Deploy to a new Netlify site (e.g., `thriving-mobile.netlify.app`).
- **Test:** Add to iPhone home screen. Opens fullscreen, no browser chrome, dark background, tab bar visible, no pinch-to-zoom. Feels like an app, even though every screen just says its name.

### Phase 1 — Today + Capture (Daily Driver)
**Goal:** Nick and Erin can use this every day for their core loop.

- Today screen: One Thing hero card, queue list, overdue section.
- Capture bottom sheet: text input, goal picker, deadline picker, "Add" button.
- Task detail bottom sheet (shared component — used everywhere from here on).
- Swipe-to-complete on queue items.
- **Test:** Open app on phone → see One Thing and queue → capture a new task → swipe to complete a task → all data persists in Supabase.

### Phase 2 — Tasks
**Goal:** Full task management on mobile.

- Tasks screen: search, filter chips, grouped task list.
- Swipe gestures (right to complete, left for actions).
- Task detail bottom sheet fully functional (edit title, notes, deadline, goal assignment, status).
- **Test:** Find a specific task via search → edit its deadline → mark it complete → confirm in Supabase.

### Phase 3 — Goals + Pillars
**Goal:** The "zoom out" view.

- Goals screen: Pillar cards → Goal drill-down → Task list per goal.
- Breadcrumb navigation.
- Progress indicators on Pillars and Goals.
- **Test:** Tap through Pillar → Goal → Task → open task detail sheet → navigate back via breadcrumbs.

### Phase 4 — Domino Tree (Zone Navigation)
**Goal:** The signature feature, built for mobile.

- Level 1: Pillar Map.
- Level 2: Goal Clusters with task count indicators.
- Level 3: Task Chain with dependency lines (vertical layout, bezier curves).
- Zone navigation: breadcrumbs, back gesture, drill-down transitions.
- **Test:** Open Tree → see all Pillars → tap one → see its Goals → tap a Goal → see the task chain → tap a task → detail sheet opens → navigate back to Level 1 via breadcrumbs.

### Phase 5 — Attachments
**Goal:** Photo/document capture attached to tasks.

- Camera/photo picker in capture sheet and task detail sheet.
- Supabase Storage integration.
- `task_attachments` and `task_attachment_links` tables (create if they don't exist).
- Multi-attach: one photo → multiple tasks.
- Thumbnail grid in task detail sheet.
- **Test:** Take a photo → attach to a task → see thumbnail in task detail → attach same photo to a second task → confirm both show the thumbnail.

### Phase 6 — Polish and Birds-Eye
**Goal:** Refinement pass.

- Birds-eye overview on Tree screen.
- Animation polish (spring sheets, completion animations, zone transitions).
- Empty states for all screens (no data yet scenarios).
- Onboarding flow for new users (if needed for Erin).
- Performance audit (no jank on scroll, sheets open instantly).
- Weekly review screen (guided walkthrough of incomplete tasks, unassigned items, stale goals).

---

## CONSTRAINTS AND RULES

1. **Mobile-first means mobile-only for now.** Do not add desktop breakpoints or responsive layouts. Design for 375px-430px width (iPhone range). Desktop can come later as an enhancement.
2. **One screen at a time.** Each tab is a stack navigator. Drilling into a Goal from the Goals tab pushes a screen onto that tab's stack. The tab bar stays visible always (except when a full-screen sheet is open).
3. **Auto-save everything.** No "Save" buttons. Changes sync to Supabase as the user makes them, with optimistic UI updates.
4. **Offline tolerance.** If network drops, the app should not crash or show errors. Queue changes and sync when connection returns. (Full offline-first can be a future enhancement, but basic tolerance is required from Phase 0.)
5. **Performance budget:** First contentful paint < 2s on 4G. Tab switches < 100ms. Sheet open < 200ms.
6. **Accessibility minimums:** All interactive elements have aria labels. Color is never the only indicator of state (always pair with icon or text). Touch targets 44x44px minimum.

---

## HOW TO USE THIS SPEC WITH THE PIPELINE

For each phase:
1. Nick opens a fresh Claude Code session (`/clear` or new terminal).
2. Nick says: "Read MOBILE-REBUILD-SPEC.md. Build Phase [N]."
3. Claude Code writes PLAN.md scoped to that phase.
4. The 7-agent review team reviews the plan.
5. Claude Code builds on a feature branch.
6. Manager hook runs typecheck + tests.
7. 7-agent code review.
8. PR → CI → auto-merge.
9. Nick tests on his phone.
10. If good, move to next phase. If issues, Nick describes the problem and Claude Code fixes.

**Do not build multiple phases at once.** Each phase must be merged and tested before starting the next.
