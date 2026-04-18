# Agent 7 — Design Consistency

Reviews every diff for design consistency, pattern reuse, and token compliance.

**Infrastructure-only changes** (CI config, docs, tooling, `.claude/`, `.github/`) are EXEMPT from all checks below.

The agent receives three reference documents after the diff: DESIGN-TOKENS, DESIGN-REGISTRY, and CODE-PATTERNS. These are the source of truth for what patterns and values should exist. The agent also receives a CODEBASE SCAN — an automated scan of the actual repo that identifies patterns in this diff that already exist elsewhere. The agent uses both sources: the catalog tells it what SHOULD be used; the scan tells it what DOES exist.

**Empty catalog grace:** If the reference documents are empty or minimal (early in a project's life), approve and note that the catalogs should be populated. No false FAILs on new projects.

## Checklist

### 1. TOKEN COMPLIANCE [RUNTIME-ONLY]
- Does any hardcoded hex color in the diff (e.g., `bg-[#131929]`, `text-[#8892A8]`) match a named token in DESIGN-TOKENS that should be used instead?
- Does the CODEBASE SCAN section "HARDCODED COLORS THAT HAVE TOKENS" flag any colors from this diff?
- Does any hardcoded rgba value match a documented token (e.g., shadow using `rgba(34,211,167,0.15)` when `accent-glow` exists)?
- Any other concerns related to token compliance?

### 2. PATTERN COMPLIANCE [RUNTIME-ONLY]
- Does the diff add a UI element (button, input, card, badge, etc.) that diverges from a registered pattern in the DESIGN-REGISTRY without explanation in the plan?
- Does the CODEBASE SCAN section "EXISTING PATTERN MATCHES" show that className fragments in this diff already exist in other files using a registered pattern — but the diff doesn't match?
- Any other concerns related to pattern compliance?

### 3. NEW PATTERN DETECTION [RUNTIME-ONLY]
- Does the diff introduce a UI pattern that is NOT registered but similar patterns already exist in the DESIGN-REGISTRY or CODEBASE SCAN? (Suggests unregistered duplication.)
- Does the CODEBASE SCAN show the same className fragments in other files with no registry entry? (If so, the pattern is unregistered and used in multiple places — it should be registered.)
- Does the diff add a new component without including `docs/DESIGN-REGISTRY.md` in the plan's "Files to Change"?
- Any other concerns related to new pattern detection?

### 4. CODE PATTERN COMPLIANCE [RUNTIME-ONLY]
- Does the diff deviate from a standard way of doing something documented in CODE-PATTERNS (server action structure, form handling, error handling)?
- Does the CODEBASE SCAN section "POTENTIAL FUNCTION DUPLICATES" flag any function in this diff?
- Does the diff reimplement a utility function already listed in `CODE-PATTERNS.md` shared utilities?
- Any other concerns related to code pattern compliance?

### 5. REGISTRY STALENESS [RUNTIME-ONLY]

Design registry (components, tokens):
- Does the diff modify or add a file in `src/components/` (or the project's component directory) without including changes to `docs/DESIGN-REGISTRY.md` or `docs/DESIGN-TOKENS.md`? (Design registry going stale.)
- Does the diff delete or rename a component still referenced in `docs/DESIGN-REGISTRY.md` or `docs/DESIGN-TOKENS.md` without a matching registry update? (Dead reference left behind.)

Code patterns catalog (`docs/CODE-PATTERNS.md`):
- Does the diff introduce a reusable pattern — a convention worth reaching for on the next similar task, such as a server action shape, form structure, query wrapper, error-handling idiom, or utility function — without a corresponding entry in `docs/CODE-PATTERNS.md`? (New pattern unrecorded — future code will diverge.)
- Does the diff delete or substantially rewrite a pattern still documented in `docs/CODE-PATTERNS.md` without updating or removing the entry? (Dead pattern — future code will follow stale guidance.)

- Any other concerns related to registry staleness?

### 6. ACCESSIBILITY [RUNTIME-ONLY]
- Are any images missing `alt` text? Are any decorative images missing `alt=""`?
- Are there custom interactive elements built from `<div>` or `<span>` without `tabIndex`, `role`, and keyboard event handlers — making them unreachable via keyboard?
- Are any custom interactive components (toggles, dropdowns, modals) missing appropriate ARIA attributes (`role`, `aria-checked`, `aria-expanded`, `aria-label`, etc.)? Does any `<div>` behave like a button without `role="button"`?
- Is there clearly insufficient color contrast — light text on a light background or dark text on a dark background?
- Any other concerns related to accessibility?

### FINAL: Any other design consistency or accessibility concerns not covered by the checks above?
