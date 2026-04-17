# Agent 2 — Code Quality & Standards

Reviews every diff for code quality, standards compliance, and pattern consistency.

**REDESIGN HANDLING:** If the plan's TYPE field is REDESIGN, new components that replace items listed in "Files to Delete" are intentional replacements, not duplication. Only flag duplication against files NOT listed in the deletion plan. All other rules apply identically.

## Checklist

### 1. SANDI METZ RULES (hard limits)
- Are any files over 100 CODE lines? (Comments and blank lines excluded. Exempt: migration files, test files, type-only files.)
- Are any functions over 25 CODE lines? (Same exclusions.)
- Does any function have more than 4 parameters? (Should use an options object.)
- Is nesting deeper than 3 levels anywhere? Are there nested ternaries?
- Does any file export more than 3 members? (TypeScript type/interface exports are exempt.)
- Any other concerns related to Sandi Metz rules?

### 2. TYPESCRIPT STRICT
- Does the diff use the `any` type anywhere?
- Does the diff use `as any` or `as unknown as X` to bypass type safety?
- Any other concerns related to TypeScript strictness?

### 3. FUNCTION DOCUMENTATION
- Is any exported function missing a comment explaining what triggers it, what steps it takes, and what it returns?
- Are any comments just restating the function name (e.g., "Creates a task" on `createTask`)? These are insufficient.
- Would someone who does not know JavaScript fail to understand any of the comments?
- Any other concerns related to function documentation?

### 4. FILE NAMING & HEADERS
- Are any `.ts` files not using kebab-case? Are any `.tsx` component files not using PascalCase? Are any hook files missing the `use-` prefix?
- Is any new or modified `.ts`/`.tsx` file in `src/` missing its FILE, PURPOSE, CALLED BY, DATA FLOW headers? (Exempt: config files, migrations, `package.json`, generated files, `.md` files, plan files, `.claude/` files, `.github/` files.)
- Any other concerns related to file naming and headers?

### 5. FORBIDDEN IN PRODUCTION CODE
- Does the diff contain `console.log/warn/error/debug` in production code? (Exception: `scripts/` directories, test files, `.github/` scripts. Use Sentry instead.)
- Does the diff contain commented-out code blocks?
- Does any file have `'use client'` without actually using interactivity (no `useState`, `useEffect`, `onClick`, `onChange`, or other event handlers)?
- Any other concerns related to forbidden patterns in production code?

### 6. SUPABASE SERVER CLIENT PATTERN
- Is any server-side code creating its own Supabase client instead of using `getServerClient()` from `@/lib/supabase-server.ts`?
- Is `getServerClient()` using the old `{ get: (name) => ..., set: () => {}, remove: () => {} }` cookie pattern instead of the `getAll`/`setAll` API?
- Is `createServerClient()` called directly anywhere instead of importing `getServerClient()`? (Exception: the definition file itself.)
- Any other concerns related to the Supabase server client pattern?

### 7. SERVER ACTION STRUCTURE
- Are any server actions in files missing `'use server'` at the top?
- Do any server actions deviate from the pattern: get client → get user → validate → mutate → `revalidatePath`?
- Do any server actions throw or silently swallow errors instead of returning `{ error?: string }` on failure?
- Any other concerns related to server action structure?

### 8. SORT ORDER PATTERN
- Are any new `sort_order` values using `Date.now()` or timestamps instead of `array.length` or `MAX+1`?
- Any other concerns related to sort order patterns?

### 9. COMPONENT & DATA PATTERNS
- Is there more than one component per file? Are any component filenames not PascalCase?
- Is `'use client'` used on any component that doesn't actually use hooks or event handlers?
- Is server state managed without TanStack Query (`useQuery`/`useMutation`)? Is Zustand used with `useStore()` and no granular selector?
- Is any user-facing async action missing one or more of the 3 required states: loading, success, and error?
- Is any list/collection component missing a zero-items case with a user-friendly message?
- Any other concerns related to component and data patterns?

### 10. DESIGN REGISTRY
- Does `docs/DESIGN-REGISTRY.md` have a canonical pattern for the UI element being added, but the new component doesn't match it or duplicates it?
- Any other concerns related to the design registry?

### 11. CODE REUSE
- Does the diff reimplement a function already documented as a shared utility in `CODE-PATTERNS.md`?
- Does the CODEBASE SCAN report "POTENTIAL FUNCTION DUPLICATES" for any function in this diff? If so, is the match real?
- Does the CODEBASE SCAN show className strings in this diff that already exist in other files — suggesting the diff should be reusing an existing pattern?
- Are there raw `supabase.from()` calls in components instead of going through shared action functions?
- Any other concerns related to code reuse?

### FINAL: Any other code quality or standards concerns not covered by the checks above?
