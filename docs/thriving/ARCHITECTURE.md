# Thriving — Application Architecture

> **Product Classification**: Product (intended for commercial SaaS release)
> **Owner**: University of Peak Performance
> **Read GLOBAL_STANDARDS.md first.** This document extends those standards for Thriving specifically.

---

## 1. What Thriving Does

Thriving is a goal and task management application organized around **Life Pillars** — the major areas of a person's life. It helps users break big goals into actionable steps and focus on what matters most right now.

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Life Pillar** | A major life area (e.g., Health, Business, Family, Outdoors). Users define their own pillars. |
| **Goal** | A significant outcome within a pillar (e.g., "Run a marathon" under Health). |
| **Task** | A concrete action that moves a goal forward. Tasks can be nested (subtasks). |
| **One Thing Mode** | Focus mode that surfaces the single most important next action across all pillars. |

### Hierarchy

```
User
└── Life Pillars (7 default, customizable)
    └── Goals
        └── Tasks
            └── Subtasks (1 level deep max)
```

---

## 2. Key Features (MVP)

### 2.1 Pillar Management
- Default 7 pillars on signup (user can rename, add, remove, reorder)
- Each pillar has a name, icon, and color
- Dashboard shows all pillars with progress summary

### 2.2 Goal Management
- Goals belong to exactly one pillar
- Goals have: title, description, target date (optional), status (active/completed/archived)
- Goals can be reordered within a pillar

### 2.3 Task Management
- Tasks belong to exactly one goal
- Tasks have: title, notes, due date (optional), priority (1-4), status (todo/in-progress/done)
- Tasks can have subtasks (one level only — no infinite nesting)
- Drag-and-drop reordering within a goal
- Tasks can be moved between goals

### 2.4 One Thing Mode
- Surfaces the single highest-priority incomplete task across all pillars
- Selection logic: priority (highest first) → due date (soonest first) → manual override
- Full-screen focused view with just that task
- Complete → next One Thing surfaces automatically
- User can manually set any task as "The One Thing"

### 2.5 Dashboard
- Overview of all pillars
- Progress indicators per pillar and per goal
- Quick-add task from dashboard
- Upcoming due dates

---

## 3. Data Model

### 3.1 Database Tables

```sql
-- Users (managed by Supabase Auth)

-- life_pillars
id              uuid        PK, default gen_random_uuid()
user_id         uuid        FK → auth.users, NOT NULL
name            text        NOT NULL
icon            text        default 'target'
color           text        default '#6366f1'
sort_order      integer     NOT NULL
is_archived     boolean     default false
created_at      timestamptz default now()
updated_at      timestamptz default now()

-- goals
id              uuid        PK
user_id         uuid        FK → auth.users, NOT NULL
pillar_id       uuid        FK → life_pillars, NOT NULL
title           text        NOT NULL
description     text
target_date     date
status          text        CHECK (active, completed, archived), default 'active'
sort_order      integer     NOT NULL
created_at      timestamptz default now()
updated_at      timestamptz default now()

-- tasks
id              uuid        PK
user_id         uuid        FK → auth.users, NOT NULL
goal_id         uuid        FK → goals, NOT NULL
parent_task_id  uuid        FK → tasks (self-ref, nullable — for subtasks)
title           text        NOT NULL
notes           text
due_date        date
priority        integer     CHECK (1-4), default 3
status          text        CHECK (todo, in_progress, done), default 'todo'
is_one_thing    boolean     default false
sort_order      integer     NOT NULL
created_at      timestamptz default now()
completed_at    timestamptz
updated_at      timestamptz default now()
```

### 3.2 Row Level Security

Every table enforces:
```sql
-- Users can only see/modify their own data
CREATE POLICY "users_own_data" ON [table]
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3.3 Key Constraints

- `is_one_thing` can only be true for ONE task per user at a time (enforced via trigger or application logic).
- `parent_task_id` can only reference a task within the same goal.
- `sort_order` is scoped: pillars globally, goals within pillar, tasks within goal.

---

## 4. Route Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (app)/                      # Authenticated layout
│   ├── layout.tsx              # Sidebar + header
│   ├── dashboard/page.tsx      # Pillar overview
│   ├── pillars/
│   │   └── [pillarId]/
│   │       └── page.tsx        # Goals within pillar
│   ├── goals/
│   │   └── [goalId]/
│   │       └── page.tsx        # Tasks within goal
│   ├── one-thing/page.tsx      # One Thing focused mode
│   └── settings/page.tsx       # User preferences
└── api/                        # Server actions preferred, but API routes if needed
```

---

## 5. Component Architecture

### 5.1 Page Components (Server Components)
- Fetch data on the server.
- Pass data to client components as props.
- Handle redirects for unauthenticated users.

### 5.2 Feature Components (Client Components)
- Receive data via props or TanStack Query.
- Handle user interactions.
- Call Server Actions for mutations.

### 5.3 Shared UI Components (from packages/ui)
- Buttons, inputs, modals, cards — all from shadcn/ui.
- App-specific compound components live in the app's `components/` dir.

### 5.4 Component Size Guide

| Component Type | Max Lines | If Larger... |
|----------------|-----------|--------------|
| Page | 50 | Extract into feature components |
| Feature | 80 | Split into sub-components |
| UI primitive | 40 | It's doing too much |
| Hook | 60 | Split into smaller hooks |

---

## 6. State Architecture

```
Server (Supabase)
    ↕ TanStack Query (cache + sync)
Client Global (Zustand)
    → auth state, UI preferences, sidebar open/closed
Client Local (useState)
    → form inputs, modal visibility, drag state
URL (searchParams)
    → active pillar filter, sort preference
```

### Zustand Store Shape (Minimal)

```typescript
interface AppStore {
  // UI state only — data lives in TanStack Query
  sidebarOpen: boolean
  toggleSidebar: () => void
  oneThingOverride: string | null  // task ID manually set as One Thing
  setOneThingOverride: (taskId: string | null) => void
}
```

---

## 7. One Thing Algorithm

The One Thing is selected by this priority chain:

1. **Manual override**: If user has set a specific task as One Thing → use it.
2. **Priority**: Highest priority incomplete task (priority 1 > 2 > 3 > 4).
3. **Due date**: Among equal priority, soonest due date wins.
4. **Recency**: Among equal priority and no due date, most recently created wins.

```typescript
// Pseudocode for One Thing selection
function selectOneThing(tasks: Task[]): Task | null {
  const incomplete = tasks.filter(t => t.status !== 'done')
  const override = incomplete.find(t => t.is_one_thing)
  if (override) return override

  return incomplete.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    if (a.due_date && b.due_date) return compareAsc(a.due_date, b.due_date)
    if (a.due_date) return -1
    if (b.due_date) return 1
    return compareDesc(a.created_at, b.created_at)
  })[0] ?? null
}
```

---

## 8. Future Features (Post-MVP)

These are NOT to be built yet. Listed for architectural awareness only.

### 🎙️ TOP PRIORITY: Voice Task Capture
> Added 2026-03-14 by Nick

Microphone input → AI transcription → AI understands the user's pillars, goals, and context → automatically creates and organizes tasks. The user talks, the app thinks, tasks appear in the right place.

**Concept**: User holds a button and says something like *"I need to call the insurance company about the dock claim and also schedule a dentist appointment."* The AI:
1. Transcribes the audio (Whisper or similar)
2. Understands the user's existing pillar/goal structure
3. Creates tasks in the correct places (dock claim → Finances or Home; dentist → Health)
4. Confirms with the user before committing

**Architectural implications to keep in mind now**:
- Task creation must be abstracted cleanly (Server Actions are already the right pattern)
- Pillar/goal context must be fetchable server-side for AI to reason about
- Will need an OpenAI/Anthropic API route for transcription + structured output
- UI will need a persistent "capture" button accessible from anywhere in the app

### Other Post-MVP Features
- **Recurring tasks**: Weekly/monthly task templates
- **Collaboration**: Share pillars/goals with accountability partner (Erin)
- **Analytics**: Progress over time, completion streaks
- **AI suggestions**: "Based on your goals, your One Thing should be..."
- **Mobile PWA**: Progressive Web App for mobile access
- **Billing**: Stripe integration for subscription tiers

Architectural decisions today should not prevent these — but don't build for them either.

---

## 9. Default Life Pillars

On signup, new users get these 7 pillars (all customizable):

1. 🏋️ Health & Fitness
2. 💼 Career & Business
3. 👨‍👩‍👧‍👦 Family & Relationships
4. 💰 Finances
5. 🌲 Outdoors & Adventure
6. 🏠 Home & Environment
7. 📚 Growth & Learning

---

## 10. Development Priorities

When building Thriving, OpenClaw should follow this order:

1. **Auth flow** — Login, signup, protected routes
2. **Data layer** — Supabase tables, RLS, types, client setup
3. **Pillar CRUD** — Create, read, update, delete, reorder pillars
4. **Goal CRUD** — Same within pillars
5. **Task CRUD** — Same within goals, including subtasks
6. **One Thing Mode** — The focused view
7. **Dashboard** — Overview with progress
8. **Polish** — Loading states, error handling, empty states, animations

Each step should be a complete, tested, deployable unit.
Every PR goes through the automated gauntlet (Greptile, Snyk, Qodo,
GitHub Actions) before Nick reviews.

---

Last updated: 2026-03-04
Maintained by: Nick + Coder Agent
