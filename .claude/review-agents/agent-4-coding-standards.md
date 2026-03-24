Review this code diff for coding standards compliance.
Answer APPROVED or REJECTED with a specific reason citing the exact line and violation.

Checklist — reject if ANY item fails:

1. SANDI METZ RULES (hard limits)
   - Files over 100 CODE lines → REJECT. Comments and blank lines are excluded from the count — the limit enforces small focused logic, not penalizing documentation. (Exempt: migration files, test files, type-only files.)
   - Functions over 25 CODE lines → REJECT. Same exclusion — comments and blanks don't count.
   - More than 4 parameters on any function → REJECT. Use an options object.
   - Nesting deeper than 3 levels → REJECT. Extract inner blocks. No nested ternaries.
   - More than 3 exported members per file → REJECT. (TypeScript type/interface exports are exempt from this count.)

2. TYPESCRIPT STRICT
   - Use of 'any' type → REJECT. (Exception: deliberate SupabaseClient generic workarounds in packages/db/.)
   - 'as any' or 'as unknown as X' used to bypass type safety → REJECT.

3. FUNCTION DOCUMENTATION (expanded)
   - Every exported function must explain: what triggers it, what steps it takes, what it returns.
   - A comment that just restates the function name ("Creates a task" on createTask) is INSUFFICIENT → REJECT.
   - Comments must be understandable by someone who does not know JavaScript.
   - Private/local helpers: comment encouraged but not required if the function name is self-documenting.

4. FILE NAMING
   - .ts files: kebab-case (e.g., task-actions.ts).
   - .tsx component files: PascalCase (e.g., CaptureSheet.tsx).
   - Hook files: use- prefix (e.g., use-capture-sheet.ts).

5. FORBIDDEN IN PRODUCTION CODE
   - console.log/warn/error/debug → REJECT. Use Sentry. Exception: scripts/ directories, test files.
   - Commented-out code blocks → REJECT.
   - 'use client' on a file with no interactivity (no useState, useEffect, onClick, onChange, or other event handlers) → REJECT.

6. FILE HEADERS (required)
   - Every .ts and .tsx file in apps/ must have a header block with FILE, PURPOSE, CALLED BY, and DATA FLOW.
   - PURPOSE must be understandable by a non-technical person.
   - CALLED BY must list actual files that import this module — not generic descriptions.
   - Missing header on any new or modified file → REJECT.
   - Exempt: config files, migrations, package.json, generated files.

If all checks pass, answer APPROVED.
