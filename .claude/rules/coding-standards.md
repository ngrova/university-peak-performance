# Coding Standards

## Sandi Metz Rules

- Files: 100 CODE lines max (comments and blank lines are excluded — the limit enforces small focused logic, not penalizing documentation)
- Functions: 25 CODE lines max (same exclusion — comments and blanks don't count)
- Parameters: 4 max per function — use an options object if you need more
- Nesting: 3 levels max — extract into helper functions
- Exported functions: 3 max per file

## File Header Comments (required on all .ts and .tsx files in apps/)

Every source file must begin with a header block:

```
// ═══════════════════════════════════════════════════════════
// FILE: [filename]
// PURPOSE: [1-2 sentences in plain English — what this file does,
//   written so a non-coder could understand it]
// CALLED BY: [list the files/components that import or use this file]
// DATA FLOW: [where data comes from → what happens → where it goes]
// ═══════════════════════════════════════════════════════════
```

Every exported function must have an expanded comment explaining:
- What triggers this function (user action, page load, other function)
- What steps it takes (in plain English, not code jargon)
- What it returns and what happens next

Exempt: config files (tsconfig, postcss, eslint, tailwind, next.config), package.json, migration files, generated files.

## TypeScript and React

- TypeScript strict mode — never use `any`
- Every function gets a one-line comment explaining what it does
- Server Components by default — add 'use client' only when interactivity is needed
- One component per file — no multi-component files
- Tailwind CSS for all styling — no custom CSS files
- shadcn/ui as the component library — customize via Tailwind
- Zustand for client state with granular selectors — never subscribe to the entire store
- TanStack Query for server state (data from Supabase/APIs)

## File Naming

- `kebab-case.ts` for all files
- `ComponentName.tsx` for React components (PascalCase)
- `use-hook-name.ts` for hooks (kebab-case with use- prefix)
- `*.test.ts` for tests (co-located next to source)
- `*.types.ts` for type definitions

## Configuration

- All config values come from environment variables — never hardcode secrets or API keys
- Skills read config from env vars, not hardcoded values
- `.env.local` for development, Netlify environment variables for production

## Resilience Rules

### State Handling

- Every user-facing action handles 3 states: loading, success, error
- Every page handles empty states (no data yet) and error states (fetch failed) gracefully
- Disable submit buttons on click to prevent double-submission

### Error Handling

- Use try/catch on all async operations with actionable error messages
- Error messages tell the user what happened AND what to do: "Failed to save — check your connection and try again"
- Implement optimistic updates with rollback on failure, OR show a clear error with retry option
- Users must never lose typed data due to network interruption

### Error Boundaries

- Wrap every route/page in a React error boundary reporting to Sentry
- One bad component must not white-screen the entire app
- Error boundaries show a user-friendly fallback UI

### Data Integrity

- Validate inputs at the database level (CHECK, NOT NULL, UNIQUE, RLS)
- Database-level constraints enforce all data rules — frontend validation is for UX only
- All Supabase schema changes go through migration files via Supabase CLI — never edit the dashboard directly
- Migration files are committed to the repo for rollback capability

### Query Safety

- Paginate all database queries — default limit 50 rows, never fetch unbounded result sets
- Virtualize or paginate list renders for collections that could exceed 100 items
- Always list explicit columns in Supabase queries — never use `.select('*')`

### Security

- The Supabase `service_role` key must never appear in client-side code
- `service_role` may only be used in server-side code (API routes, Edge Functions, scripts)
- Never use `dangerouslySetInnerHTML`
- Never use `eval()`
- Never construct Supabase queries with string concatenation or raw SQL
