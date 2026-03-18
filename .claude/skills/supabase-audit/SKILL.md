---
name: supabase-audit
description: Audits Supabase RLS policies, table schemas, and security configuration by scanning the codebase and calling the Supabase Management API via scripts. Use for security audits or when checking RLS policies.
user_invocable: true
---

# supabase-audit

Run a comprehensive security audit on the Supabase configuration and codebase.

## Step 1 — Codebase Scan

Use Grep to check for these issues across the entire codebase:

1. **`.select('*')` usage** — Search for `.select('*')` or `.select("*")` in all .ts/.tsx files. Each match is a violation.
2. **service_role key in client code** — Search for `service_role` or `SUPABASE_SERVICE_ROLE` in any file under `apps/` that is NOT in an `api/` route or server-only file. Any match in client code is critical.
3. **Hardcoded keys** — Search for patterns like `eyJ`, `sk-`, `sb-` followed by long strings in source files. Exclude .env files.
4. **dangerouslySetInnerHTML** — Search all .tsx files. Any match is a violation.
5. **eval()** — Search all .ts/.tsx files. Any match is a violation.
6. **Raw SQL** — Search for string concatenation in Supabase queries (template literals with `.rpc(` or `.from(`).

## Step 2 — Run API Audit Script

Run the audit script at `.claude/skills/supabase-audit/scripts/audit-rls.js` to check:

1. RLS is enabled on every table
2. All RLS policies reference `auth.uid()`
3. Storage bucket policies are scoped to ownership
4. Tables have appropriate constraints (NOT NULL, CHECK, UNIQUE)

The script reads credentials from environment variables:
- `SUPABASE_PROJECT_ID` or falls back to the hardcoded project ID in the script
- `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`

## Step 3 — Generate Report

Present findings as a table:

```
## Supabase Security Audit Report

### Critical Issues
- [List any service_role exposure, missing RLS, hardcoded keys]

### Violations
- [List .select('*'), missing constraints, dangerouslySetInnerHTML, eval]

### Recommendations
- [Suggested fixes for each issue]

### Clean
- [Areas that passed inspection]
```

## Rules

- Never output actual API keys or secrets in the report — just note their location
- Config values come from environment variables, never hardcoded in scripts
- If the audit script doesn't exist yet, create it first
