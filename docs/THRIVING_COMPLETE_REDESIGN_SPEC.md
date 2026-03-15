# THRIVING APP — Mobile-First Redesign Spec (Complete)

**From:** Opus, grounded in Albus's full codebase dump (March 15, 2026)
**For:** Albus — read fully, then implement page by page
**Live URL:** https://thriving-app.netlify.app

---

## The Core Problem

The app has a split design personality. Half the pages use the warm dark system (login, One Thing, assessment, tree, tab bar). The other half use leftover light-mode styles (bg-white, text-gray-900, indigo-600): Deadlines, Queue, Scorecard, Goal detail, TaskForm, TaskCard edit/delete buttons. On a phone, it feels like two different apps.

The structure is sound — layout shell, routing, tab bar, Supabase backend, auth, tree with touch. What's broken is visual consistency and mobile interaction patterns.

---

## Design Direction

**Tone:** Warm, grounded, motivating. Think: a leather journal meets a wellness app. NOT corporate task management.

**The system that already works (keep and extend):**
- Background: warm dark tones (`#1A1410` base, `#2D2318` surfaces, `#3D3025` elevated)
- Text: `#FAF7F2` primary, `#C4B5A0` secondary, `#8A7B6B` muted
- Accent: amber-400 to amber-500 (`#FBBF24` to `#F59E0B`)
- Font: Fraunces for display/branding, system sans for body
- Corners: rounded-2xl for cards, rounded-xl for buttons, rounded-lg for inputs
- The 🌱 emoji and "Thriving" branding

**CSS Variables (define once in globals.css, use everywhere):**
```css
:root {
  --bg-base: #1A1410;
  --bg-surface: #2D2318;
  --bg-elevated: #3D3025;
  --bg-input: #4A3D30;
  --text-primary: #FAF7F2;
  --text-secondary: #C4B5A0;
  --text-muted: #8A7B6B;
  --accent: #FBBF24;
  --accent-hover: #F59E0B;
  --accent-muted: rgba(251, 191, 36, 0.15);
  --border: rgba(250, 247, 242, 0.08);
  --border-hover: rgba(250, 247, 242, 0.15);
  --success: #4ADE80;
  --danger: #F87171;
  --warning: #FB923C;
}
```

---

## Global Rules for Every Page

1. **No bg-white, no text-gray-900, no indigo-600, no bg-slate-50 anywhere.** Replace all with CSS vars above.
2. **Minimum touch target: 44px height on all interactive elements.** Buttons, checkboxes, links that do things.
3. **No inline edit forms.** All editing happens in bottom sheets (slide-up panels) or dedicated modals.
4. **Font sizes on mobile:** Headings 24-32px (not text-4xl which is 36px). Body 16px. Labels/meta 13-14px. Nothing below 12px.
5. **All cards use:** `background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px;`
6. **All buttons use:** `background: var(--accent); color: #1A1410; border-radius: 12px; min-height: 44px; font-weight: 600;`
7. **Secondary buttons:** `background: transparent; border: 1px solid var(--border); color: var(--text-secondary);`
8. **Destructive buttons:** `background: transparent; border: 1px solid rgba(248,113,113,0.3); color: var(--danger);`

---

## Page-by-Page Spec

### 1. Login (`login/page.tsx` — 84 lines)

**What works:** Layout, background gradient, Fraunces title, centered card. Structurally fine on mobile.

**What to fix:**
- Change subtitle from "Ensure Nick is Thriving" to just "Welcome back" or remove it entirely. The hardcoded name is embarrassing for Erin.
- Make the email and password inputs use `var(--bg-input)` background, `var(--text-primary)` text, `var(--border)` border. Min height 48px for easy tapping.
- Sign in button: full width, 48px height, amber accent, bold text.
- "Don't have an account?" link: `var(--text-secondary)`, 44px tap target.
- Add the 🌱 icon above the title for brand consistency.

**Estimated diff:** ~15 lines changed. Small.

---

### 2. Signup (`signup/page.tsx` — 110 lines)

**Same fixes as Login.** Match the input styles, button styles, and remove any hardcoded user names.

---

### 3. Dashboard (`dashboard/page.tsx` — 45 lines + PillarCard component)

**Current problem:** Buried in "More" drawer. 3-4 taps to reach tasks. White/gray PillarCard styling likely mismatched.

**What to fix:**
- PillarCard: `background: var(--bg-surface)`, `border: 1px solid var(--border)`, `border-radius: 16px`. Pillar color as a 4px left border accent, not the full card background.
- Each card shows: pillar icon + name (16px bold), emotional description (14px secondary), progress bar (amber fill on dark track), "X of Y tasks" count.
- Tap a card → navigates to pillar detail. The whole card is the tap target (min 72px height).
- Keep `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.

**Navigation consideration:** Dashboard is not the primary mobile view (One Thing is), so being in "More" is acceptable. But the path from Dashboard → Pillar → Goal → Tasks is too deep. Consider adding a "jump to tasks" shortcut on each PillarCard that goes directly to the queue filtered by that pillar.

---

### 4. One Thing (`one-thing/page.tsx` — 99 lines)

**This is the best page.** Keep the overall structure. Polish:

- Breadcrumb: bump from `text-xs` to `text-sm`, use `var(--text-muted)` color. Add pillar color dot before the pillar name.
- "Focus on this" label: use `var(--accent)` color, `text-xs uppercase tracking-widest` (already good).
- Task title: `text-2xl md:text-4xl` — slightly smaller on mobile for long titles.
- Card below title: ensure it uses `var(--bg-surface)` and `var(--border)`.
- Action buttons (Complete / Blocked): full width on mobile, 48px height, stacked vertically with 8px gap. Complete = amber accent. Blocked = secondary style with warning icon.
- **Add "Next up" preview:** Below the action buttons, show a small muted card with the next task title and its pillar. "Coming next: [task title]". Tappable to peek. This requires the query to return top 2 tasks instead of 1.
- **Completion celebration:** When user taps Complete, show a brief animation (confetti burst or checkmark scale-up) before transitioning to the next task. Use CSS keyframes, keep it under 1.5 seconds.

---

### 5. Deadlines (`views/deadlines/page.tsx` — 98 lines)

**Biggest visual problem page.** Full style mismatch.

**Complete restyle:**
- Page heading: `text-xl font-bold` in `var(--text-primary)`. Drop the emoji from the heading (it's in the tab bar already).
- Group structure: group by urgency (Overdue → This Week → Later). Each group gets a small label header in `var(--text-muted)`.
- Task rows: 
  ```
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
  ```
- Overdue tasks: add `border-left: 3px solid var(--danger)` accent.
- Row layout on mobile (keep flex-col):
  - Line 1: Task title (16px, `var(--text-primary)`), truncate with ellipsis
  - Line 2: Goal name (13px, `var(--text-muted)`) · Assignee pill · Due date in colored text (red if overdue, amber if this week, muted if later)
- Each row tappable → opens task detail bottom sheet (see below).
- Remove all bg-white, text-gray-900, border-gray-* classes.

---

### 6. Queue (`views/queue/page.tsx` — 96 lines)

**Same restyling as Deadlines.** Additionally:

- Filter tabs at top (Nick / Erin / All): horizontally scrollable row of pill buttons. Active = amber fill + dark text. Inactive = `var(--bg-elevated)` + `var(--text-secondary)`. Min 44px height per pill.
- Task rows: same card style as Deadlines.
- Row layout on mobile:
  - Line 1: Status icon (larger — 24px touch target) + Task title
  - Line 2: Goal name · Priority badge · Due date if present
- Tap status icon → cycles status (not started → in progress → done). Large enough to hit with thumb.
- Tap the row → opens task detail bottom sheet.
- Long-press to reorder (nice-to-have, defer if complex).

---

### 7. Tree View (`views/tree/TreeView.tsx` — 78 lines + related files)

**Phase 2 is working (touch/pinch). Keep it.**

**Polish:**
- Verify the canvas fills the remaining viewport below the header and above the tab bar. May need `calc(100vh - tabBarHeight - headerHeight)` or equivalent.
- TreeNode cards: ensure they use warm design system colors, not hardcoded values that don't match.
- DetailPanel: restyle to match — `var(--bg-elevated)`, `var(--text-primary)`, rounded-2xl top corners. Add Complete button (amber, 44px height). Add assignee and due date display.
- Pillar filter buttons in TreeControls: use pill style matching Queue filter tabs (amber active, elevated inactive).

---

### 8. Scorecard Landing (`scorecard/page.tsx` — 99 lines)

**Restyle to warm system:**
- Heading: `var(--text-primary)`, drop text-gray-900.
- "Take Assessment" button: amber accent, rounded-xl, 44px height.
- Assessment cards: `var(--bg-surface)`, `var(--border)`, rounded-2xl. Show date, overall score, and a small sparkline or score number.
- Delete button on assessment cards: `var(--danger)` text, 44px tap target, no tiny icon buttons.

---

### 9. Assessment Wizard (`scorecard/assessment/page.tsx` — 99 lines)

**Already well-designed.** Minor polish:
- Verify AnchoredSlider has proper touch handling (should work since it's `<input type="range">`).
- Back/Next buttons: full width on mobile, stacked, 48px height. Next = amber, Back = secondary.
- Progress indicator: amber fill on dark track.

---

### 10. Results (`scorecard/results/page.tsx` — 95 lines)

**Restyle:**
- Kill all bg-white, text-gray-900, border-gray-*.
- Score display: keep the huge number, but use `var(--accent)` for the score, `var(--text-primary)` for text.
- RadarChart container: `var(--bg-surface)`, rounded-2xl. Verify the chart itself renders with warm colors (amber/gold lines, dark background).
- Domain score list: each domain in a `var(--bg-surface)` card with the domain color as a left border accent.

---

### 11. Pillar Detail (`pillars/[pillarId]/page.tsx` — 68 lines)

**Restyle:**
- Back link: replace indigo-600 with `var(--text-muted)`. Use `← Back` text with 44px tap target.
- Heading: pillar icon + name in `var(--text-primary)`. Pillar color as accent, not text color (hard to read light colors on dark bg).
- GoalCard: `var(--bg-surface)`, rounded-xl, 16px padding. Show goal title, task count, completion percentage.
- Add Goal button: amber accent, 44px height.

---

### 12. Goal Detail (`pillars/[pillarId]/goals/[goalId]/page.tsx` — 64 lines)

**Restyle:**
- Same pattern as Pillar Detail.
- Back link → `var(--text-muted)`, 44px target.
- Heading in `var(--text-primary)`.
- TaskCard components below (see TaskCard spec).
- Add Task button: amber accent.

---

### 13. TaskCard (`components/tasks/TaskCard.tsx` — 120 lines)

**Critical mobile fixes:**
- Status icon: increase to 32px visible size, with 44px tap target area (pad with invisible touch area). Use filled/empty circles in warm colors, not unicode characters (○ ◑ ● ⊘).
- Edit/Delete buttons: **Remove from the card face.** Replace with: tap the card → opens task detail bottom sheet with Edit and Delete as large buttons inside.
- Card style: `var(--bg-surface)`, `var(--border)`, rounded-xl. 
- Layout: Status icon (left) → title + meta (center, flex-1) → priority badge or chevron (right).
- Priority badge: small pill — High = amber, Medium = muted amber, Low = muted gray.

---

### 14. TaskForm (`components/tasks/TaskForm.tsx` — 118 lines)

**Do NOT render inline anymore.** This form should only appear inside a bottom sheet or modal.

**Restyle:**
- Background: `var(--bg-elevated)` — not bg-slate-50.
- All inputs: `var(--bg-input)` background, `var(--text-primary)` text, `var(--border)` border, rounded-lg, min 44px height.
- Labels: `var(--text-secondary)`, text-sm, above each input.
- Save button: full width, amber accent, 48px height.
- Cancel button: full width, secondary style, 44px height.
- Remove indigo-600 entirely.
- On mobile, this renders inside a bottom sheet that slides up from the bottom, covering ~80% of the screen. Swipe down or tap Cancel to dismiss.

---

### 15. NEW: Task Detail Bottom Sheet

**This doesn't exist yet — build it.**

When user taps a task row (in Deadlines, Queue, or Goal Detail), a bottom sheet slides up covering ~70% of the screen. Contents:

```
┌─────────────────────────────────────────┐
│  ─── drag handle ───                    │
│                                         │
│  "Call the dock company"     [Status ●] │
│  Home Environment › Dock Repair         │
│                                         │
│  Assigned to: Nick                      │
│  Priority: High          Due: Mar 18    │
│  Failure cost: High                     │
│                                         │
│  Notes:                                 │
│  "Company said they'll come by..."      │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │         ✓ Mark Complete          │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │           ✏️ Edit Task           │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │           🗑️ Delete              │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

- All on warm dark system.
- Complete button: amber, 48px.
- Edit button: secondary style, 44px. Tapping Edit replaces the sheet content with TaskForm.
- Delete button: danger style, 44px.
- Swipe down to dismiss, or tap outside.
- `'use client'` component with useState for open/closed + which task.

**File:** `src/components/tasks/TaskDetailSheet.tsx` (~100-120 lines)

---

## Implementation Order

1. **CSS Variables:** Add the full variable set to globals.css. This is the foundation — 5 minutes.
2. **Login/Signup:** Quick wins, small diff. Gets the first impression right.
3. **TaskCard + TaskDetailSheet:** Build the sheet, rewire TaskCard to remove inline edit/delete. This is used on multiple pages.
4. **Deadlines + Queue:** Full restyle with new card patterns and the TaskDetailSheet.
5. **Scorecard (landing + results):** Restyle to warm system.
6. **Pillar Detail + Goal Detail:** Restyle back links, headings, card styles.
7. **TaskForm:** Move into bottom sheet rendering, restyle all inputs.
8. **One Thing polish:** Add "next up" preview, celebration animation.
9. **Tree polish:** DetailPanel improvements, canvas sizing.
10. **Dashboard:** PillarCard restyle (lower priority since it's in More drawer).

Each step is a separate PR. Commit, push, verify on Netlify, move to next.

---

## What NOT to Change

- Routing structure — URLs are good
- App layout shell — Phase 1 is correct
- Bottom tab bar structure — just replace unicode icons with SVG icons
- Supabase schema and actions — no backend changes
- Tree layout algorithm — working
- Assessment wizard — mostly fine, minor polish only
- Auth flow logic — working

---

## Success Criteria

Open https://thriving-app.netlify.app on an iPhone. Every page should:
1. Feel like the same app (warm dark system, no white/gray pages)
2. Have no text smaller than 12px
3. Have no tap targets smaller than 44px
4. Use bottom sheets for detail/edit, not inline forms
5. Feel like something you're proud to show someone
