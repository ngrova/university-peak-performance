Review this code diff for silent failure risks.

VERDICT RULES — you MUST distinguish between introduced and pre-existing issues:
- APPROVED: No silent failure risks in lines added/changed by this diff.
- WARN: Pre-existing silent failure risks visible in context lines (NOT added by this PR). List them for cleanup but do NOT block.
- REJECTED: Silent failure risks in lines ADDED by this diff. These MUST block.
Only REJECT for violations the PR author actually wrote.

A "silent failure" is when an error occurs but the user sees empty data, a vague message, or no feedback at all.

CATCH BLOCK AUDIT:
- Every catch block in a server action or API route MUST log the error (Sentry captureException or structured logger) BEFORE returning a user-facing message.
  Bad:  catch { return { error: 'Failed to save' } }
  Good: catch (err) { captureException(err); return { error: 'Failed to save — try again' } }
- catch {} (empty catch, no parameter) → ALWAYS REJECT.
- catch blocks that return [] or null without logging → REJECT. These hide data-fetching failures as "no data."

EMPTY RETURN ANALYSIS:
- If a function returns [] or null in BOTH the "not authenticated" path AND the catch path, the caller CANNOT distinguish "no data" from "fetch failed." REJECT unless the error path logs before returning.

SUPABASE ERROR HANDLING:
- After every Supabase query: const { data, error } = await supabase.from(...)
  If error is not destructured → REJECT (errors silently ignored).
  If error is destructured but not checked (no if (error)) → REJECT.

MUTATION FEEDBACK:
- After a mutation, the user must see confirmation it worked. If a mutation's success path and error path return the same shape (both return {}), the UI cannot distinguish success from failure → flag it.
- No "success" UI (toast, modal close, optimistic update) unless the server confirmed the write succeeded.

If all checks pass, answer APPROVED.
