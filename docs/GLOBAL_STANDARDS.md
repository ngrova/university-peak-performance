# University of Peak Performance — Global Coding Standards

> **Purpose**: This document is the single source of truth for all code written in this monorepo.
> The Coder agent (OpenClaw) MUST read this file before writing any code.
> Human developers follow these standards equally.
> Greptile enforces these standards automatically on every PR.

---

## 1. Philosophy

**We optimize for readability, maintainability, and autonomous development.**

Code in this repo is primarily written by an AI agent (Coder) and reviewed by
automated tools (Greptile, Snyk, Qodo) before human approval. That means:

- Conventions beat cleverness. Always.
- If a pattern requires explanation, it's the wrong pattern.
- Every file should be understandable in isolation.
- Automation-first: if a human has to do it twice, automate it.

---

## 2. File Structure Rules (Sandi Metz Style)

### 2.1 Size Limits

| Rule | Limit | Why |
|------|-------|-----|
| Lines per file | ≤ 100 lines | Keeps files focused and reviewable |
| Functions per file | ≤ 3 exported functions | Forces single responsibility |
| Parameters per function | ≤ 4 parameters | Use an options object if you need more |
| Nesting depth | ≤ 3 levels | Extract into helper functions |
| Lines per function | ≤ 25 lines | If longer, it does too much |

### 2.2 File Naming

```
kebab-case.ts          # All files
ComponentName.tsx      # React components only (PascalCase)
use-hook-name.ts       # React hooks (kebab-case with "use-" prefix)
*.test.ts              # Tests sit next to source files
*.types.ts             # Type definitions
```

### 2.3 Directory Structure Per Feature

```
feature-name/
├── index.ts                  # Public API (re-exports only)
├── FeatureName.tsx           # Main component
├── FeatureName.test.tsx      # Tests
├── feature-name.types.ts     # Types
├── use-feature-name.ts       # Hook (if needed)
├── feature-name.utils.ts     # Pure utility functions
└── components/               # Sub-components (if needed)
    ├── SubComponent.tsx
    └── SubComponent.test.tsx
```

---

## 3. Code Principles

### 3.1 Explicit Over Implicit

```typescript
// ❌ Implicit
processTask(task, true, false)

// ✅ Explicit
processTask(task, { markComplete: true, notify: false })
```

### 3.2 Single Source of Truth

- Every piece of data has exactly ONE owner.
- Derived data is computed, never stored separately.

```typescript
// ❌ Storing derived data
const [tasks, setTasks] = useState([])
const [completedCount, setCompletedCount] = useState(0)

// ✅ Derive it
const [tasks, setTasks] = useState([])
const completedCount = tasks.filter(t => t.completed).length
```

### 3.3 Clear Data Flow

- Props flow down. Events flow up.
- No prop drilling beyond 2 levels — use context or Zustand.
- Side effects are isolated in hooks or server actions.

### 3.4 Error Handling

- Every async operation has explicit error handling.
- User-facing errors get friendly messages.
- System errors get logged with context.
- Never swallow errors silently.

```typescript
try {
  const result = await createTask(data)
  return { success: true, data: result }
} catch (error) {
  console.error('[createTask] Failed:', { data, error })
  return { success: false, error: 'Could not create task. Please try again.' }
}
```

---

## 4. Tech Stack Standards

### 4.1 Framework: Next.js (App Router)

- Use Server Components by default.
- Add `'use client'` only when the component needs interactivity.
- Use Server Actions for mutations.
- File-based routing — no custom route configs.

### 4.2 Styling: Tailwind CSS + shadcn/ui

- Utility classes directly on elements. No CSS files.
- No custom CSS unless absolutely unavoidable (document why).
- Use shadcn/ui components as the base — customize via Tailwind.
- Design tokens (colors, spacing) defined in `tailwind.config.ts`.

### 4.3 Database: Supabase (PostgreSQL)

- All queries go through the Supabase client in `packages/db`.
- Row Level Security (RLS) on every table — no exceptions.
- Database types auto-generated from schema.
- Migrations tracked in version control.

### 4.4 State Management

| Scope | Tool | When |
|-------|------|------|
| Server state | TanStack Query | Data from Supabase/APIs |
| Global client state | Zustand | Auth state, UI preferences |
| Local component state | useState | Form inputs, toggles |
| URL state | Next.js searchParams | Filters, pagination |

### 4.5 Testing

- **Unit tests**: Vitest — for utilities, hooks, business logic.
- **Component tests**: Vitest + Testing Library — for UI behavior.
- **E2E tests**: Playwright — for critical user flows.
- Tests live next to the code they test (co-location).
- Name pattern: `[filename].test.ts(x)`

---

## 5. Git & PR Standards

### 5.1 Branch Naming

```
feature/[app]-[short-description]
fix/[app]-[short-description]
chore/[scope]-[short-description]
```

### 5.2 Commit Messages

```
type(scope): short description

feat(thriving): add task drag-and-drop reordering
fix(silver): correct position size calculation
chore(db): add migration for user preferences table
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`

### 5.3 PR Requirements (Enforced by Automated Tools)

Every PR goes through the **Automated PR Gauntlet** before Nick reviews:

| Tool | What It Checks |
|------|---------------|
| **Greptile** | Code quality, architecture compliance, bugs, style |
| **Snyk** | Security vulnerabilities, dependency risks, secrets |
| **Qodo** | Missing tests, coverage gaps, test suggestions |
| **GitHub Actions** | Test suite passes, linting, TypeScript compilation |
| **Vercel** | Preview deployment builds successfully |

Nick reviews and merges only after all automated checks pass.

---

## 6. Product Classification

| Classification | Meaning | Example |
|----------------|---------|---------|
| **Product** | Intended for commercial release as SaaS | Thriving |
| **Internal Tool** | Built for Nick's personal use, never sold | Silver Trading System |

Products get: multi-tenancy, auth, billing planning, accessibility (WCAG 2.1 AA), SEO.
Internal tools get: single-user auth, simpler architecture, still follow all coding standards.

---

## 7. Shared Packages

| Package | Purpose | Rules |
|---------|---------|-------|
| `packages/ui` | Shared React components (shadcn/ui based) | No app-specific logic |
| `packages/db` | Supabase client, types, helpers | Single connection config |
| `packages/config` | ESLint, Tailwind, TypeScript configs | Extend per-app as needed |
| `packages/utils` | Pure utility functions | Zero side effects, 100% tested |

Import rules: Apps import from packages. Packages cannot import from apps.
Packages cannot import from other packages (flat dependency).
Exception: `packages/config` can be referenced by any package.

---

## 8. Security Standards

### 8.1 Secrets

- Never commit secrets, API keys, or credentials.
- Use `.env.local` for development.
- Use Vercel environment variables for production.
- `.env.example` documents required variables (without values).
- **Snyk scans every PR for hardcoded secrets automatically.**

### 8.2 Auth

- Supabase Auth for all user authentication.
- RLS policies enforce data access at the database level.
- Server-side session validation on every protected route.

### 8.3 Input Validation

- Validate all user input with Zod schemas.
- Validate on the client (for UX) AND the server (for security).
- Shared validation schemas live in the feature's `.types.ts` file.

---

## 9. Coder Agent Instructions

When the Coder agent (OpenClaw) receives a task:

1. **Read this document first.** Every time.
2. **Read the app-specific ARCHITECTURE.md** for the target app.
3. **Plan before coding.** Write a brief plan in the PR description.
4. **Follow the file size limits.** No exceptions.
5. **Write tests.** No PR without tests.
6. **Run the full test suite** before creating the PR.
7. **Create the PR** — Greptile, Snyk, and Qodo will review automatically.
8. **If automated tools flag issues**, fix them and push updates.
9. **Notify Nick** when the PR is clean and ready for final review.

If a task conflicts with these standards, flag it — don't just do it.

---

## 10. Document Maintenance

This document evolves. When standards change:

1. Create a PR that updates this file.
2. Include the rationale for the change.
3. Update any affected code in the same PR.
4. Nick approves all standards changes.

Last updated: 2026-03-04
Maintained by: Nick + Coder Agent
