Review this code diff for silent failure risks.

Your response MUST start with exactly one word on the first line: APPROVED, WARN, or REJECTED.
- Use APPROVED if no silent failure risks exist in lines added by this diff.
- Use WARN if the only risks are pre-existing (visible in context lines, not added by this PR). List them but they do not block.
- Use REJECTED only for silent failure risks in lines the PR author actually added.
Then explain your reasoning below.

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
