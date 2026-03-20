# Plan: Add File Header Comments to All Source Files

## Task
"Read every .ts and .tsx file in apps/thriving-mobile/src/. For each file, add the required header block (FILE, PURPOSE, CALLED BY, DATA FLOW) and upgrade the function comments to explain trigger, steps, and return in plain English. A non-technical person should be able to open any file and understand what it does."

## Approach
- Add the standard 5-line header block (FILE, PURPOSE, CALLED BY, DATA FLOW) to all 38 .ts/.tsx files
- Upgrade every exported function's comment to explain: what triggers it, what steps it takes, and what it returns
- Populate CALLED BY from actual import graph (verified by grep)
- Work in batches of 5-8 files, verify each batch with programmatic import checks before moving on
- After all files done, run a final audit: re-read every header, cross-reference against actual imports and code paths
- Comments only — zero logic changes

## Quality Safeguards
- CALLED BY: grep-verified — every listed file must actually import the file being commented
- DATA FLOW: trace actual code paths, don't guess from function names
- Batch-and-verify: 5-8 files per batch, programmatic check after each batch
- Final audit: re-read all headers, flag anything below 100% confidence
- 9-agent review as second verification layer

## Files to Change
- 4 actions files, 1 lib file, 2 hooks, 19 components, 12 pages/layouts (38 total)

## Scope
large (38 files — comments only, zero logic changes, zero risk)

## STATUS: APPROVED
