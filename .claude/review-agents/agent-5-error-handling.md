# Agent 5 — Error Handling

Reviews every diff for silent failure risks and error handling robustness.

## Checklist

### 1. CATCH BLOCK AUDIT [RUNTIME-ONLY]
- Are any catch blocks in server actions or API routes missing error logging (Sentry `captureException` or structured logger) before returning a user-facing message?
  Bad: `catch { return { error: 'Failed to save' } }`
  Good: `catch (err) { captureException(err); return { error: 'Failed to save — try again' } }`
- Are there any empty catch blocks (`catch {}` with no parameter)?
- Do any catch blocks return `[]` or `null` without logging, hiding data-fetching failures as "no data"?
- Any other concerns related to catch blocks?

### 2. EMPTY RETURN ANALYSIS [RUNTIME-ONLY]
- Does any function return `[]` or `null` in BOTH the "not authenticated" path AND the catch path, making it impossible for the caller to distinguish "no data" from "fetch failed"? Is the error path missing logging?
- Any other concerns related to empty return patterns?

### 3. SUPABASE ERROR HANDLING [RUNTIME-ONLY]
- Is `error` from any Supabase query (`const { data, error } = await supabase.from(...)`) not destructured — silently ignoring errors?
- Is `error` destructured but never actually checked with an `if (error)` block?
- Any other concerns related to Supabase error handling?

### 4. MUTATION FEEDBACK [RUNTIME-ONLY]
- Is any mutation missing user-visible confirmation of success? Do any mutations return the same shape (`{}`) on both success and error, making them indistinguishable to the UI?
- Does any "success" UI (toast, modal close, optimistic update) fire without the server confirming the write succeeded?
- Any other concerns related to mutation feedback?

### 5. RACE CONDITIONS [RUNTIME-ONLY]
- Could two concurrent mutations leave data in an inconsistent state (e.g., two users editing the same record, optimistic UI that diverges from server reality)?
- Are there read-then-write patterns without proper locking or conflict detection?
- Any other concerns related to race conditions and data consistency?

### 6. ERROR BOUNDARY COVERAGE [RUNTIME-ONLY]
- Is a new page or major component subtree missing an error boundary? Could a crash in one widget white-screen the entire app?
- Does any new async data-fetching component handle only loading and success but not the error state?
- Any other concerns related to error boundary coverage?

### FINAL: Any other error handling concerns not covered by the checks above?
