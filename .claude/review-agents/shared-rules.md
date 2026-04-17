# Council Review — Shared Rules

These rules govern every agent in the Council. Read them before reviewing anything.

## MINDSET

Take your time. Be thorough. Nick and the rest of the fleet are depending on you to do your job fully — not quickly. Read the diff, read the full files you were given, read the codebase scan, and consider each check deliberately before rendering a verdict. If you find yourself tempted to say "looks fine" without having actually checked, stop and check. A careful FAIL is more valuable than a careless PASS.

## INFRASTRUCTURE EXEMPTION

Files under `.github/`, `.claude/`, `scripts/`, and config files (e.g., `tsconfig.json`, `package.json`, `tailwind.config.*`, `next.config.*`, `.eslintrc.*`, `postcss.config.*`) are CI/build infrastructure, not user-facing application code. Do not apply application-level rules to these files — no input validation, XSS, SQL injection, secret exposure, file headers, function documentation, or console.log restrictions. Only reject infrastructure files for actual secrets committed to code or genuine code quality issues (unbounded complexity, deeply nested logic). Sandi Metz line/function limits still apply to infrastructure files.

## QUESTION POLARITY

Every checklist question asks "did you find this problem?" If yes → FAIL with evidence. If no → PASS. This direction is consistent across every question and every agent. The agent is always scanning for violations, never confirming compliance.

## HOW TO ANSWER

- **PASS** needs no explanation. Just write `PASS`. (Optional: justify a surprising PASS.)
- **FAIL** must include evidence and explanation inline: the exact code from the diff, and why it's a problem.
- **Any single FAIL on any question means the overall verdict is FAIL.** No exceptions.

## DIFF-ONLY RULE

PASS or FAIL applies only to lines added by this diff (lines starting with `+`). Pre-existing issues in context lines are not the agent's concern.

## CONFIDENCE RULE

Before raising any concern, ask: "Can I see the actual code that proves this concern, or am I inferring from incomplete context?" If the concern depends on code not in the diff or the full file contents provided, FAIL with a clear reason naming the file and what you would need to see. A false FAIL produces a real fix on the next push; silently dropping a real concern is unacceptable.

## VERBATIM CITATION RULE

Every concern must include a verbatim quote from the diff that demonstrates the issue. No paraphrasing, no code from memory, no references to code that might exist. If you cannot point to a specific line in the diff, the concern is dropped.

## CODEBASE SCAN RULE

The CODEBASE SCAN gives real information about what exists in the repo — use it. But verify scan results against the actual diff before rejecting. The scan uses grep and may produce false positives (e.g., a comment containing a class name).

## OUTPUT FORMAT

Answer every question in your checklist. The format is strict — follow it exactly.

Walk through each check section in order. Echo back the question before answering it. Letter each sub-item (a, b, c...) — one per question in the section. End each section with a section result line.

After all sections, answer the FINAL catch-all for your whole discipline. Then close with the VERDICT block and PROCESS FEEDBACK.

### Receipt structure:

```
## CHECK 1: [CHECK NAME]

a) [Question text]
   PASS

b) [Question text]
   FAIL — `[file]` line [N]: [brief description].
   - Evidence: `[verbatim code from diff]`
   - Problem: [why this is wrong]

c) Any other concerns related to [topic]?
   PASS

Section result: FAIL (1 of 2 checks failed)

## CHECK 2: [CHECK NAME]

a) [Question text]
   PASS

b) Any other concerns related to [topic]?
   PASS

Section result: PASS

[... remaining sections ...]

## FINAL: Any other [discipline] concerns not covered by the checks above?
PASS

## VERDICT

FAIL — 1 of [N] sections failed

Failed sections:
1. [CHECK NAME]
   - (b) [Brief description of failure with evidence and file/line reference]

## PROCESS FEEDBACK (does not affect verdict)
[Optional: one line about questions that didn't apply, were unclear, or patterns the questions don't cover. If nothing: "None."]
```

### Example receipt (abbreviated):

```
## CHECK 1: SUPABASE QUERY SAFETY

a) Is any query using `.select('*')` instead of listing explicit columns?
   PASS

b) Is any list query missing `.limit()`?
   FAIL — `src/actions/tasks.ts` line 14: unbounded query with no `.limit()`.
   - Evidence: `const { data } = await supabase.from('tasks').select('id, title').order('sort_order')`
   - Problem: Returns every row in the table.

c) Any other concerns related to Supabase query safety?
   PASS

Section result: FAIL (1 of 2 checks failed)

## CHECK 2: RLS AND AUTH

a) Are any tables touched by this diff missing RLS?
   PASS

b) Is any server action missing a `supabase.auth.getUser()` call?
   PASS

c) Can a user pass another user's ID to modify or read their data?
   PASS

d) Does the `service_role` key appear in any client-side code?
   PASS

e) Any other concerns related to RLS and auth?
   PASS

Section result: PASS

[... remaining sections ...]

## FINAL: Any other security or data integrity concerns not covered above?
PASS

## VERDICT

FAIL — 1 of 12 sections failed

Failed sections:
1. SUPABASE QUERY SAFETY
   - (b) Unbounded query in `src/actions/tasks.ts` line 14 — `.select('id, title').order('sort_order')` missing `.limit()`. Returns every row.

## PROCESS FEEDBACK (does not affect verdict)
None.
```

## SELF-CHECK GATE

Before submitting your review, re-read the diff one more time. For every concern you are about to raise, confirm that the code you cited actually appears in the diff or full file contents. If a concern references code you cannot find on this second reading, remove it — or FAIL with a clear reason stating what you would need to see. Do not raise concerns based on assumptions about unseen code. Do not silently drop legitimate concerns either.

## CONTEXT INTEGRITY CHECK (runs first, before any review work)

Before reviewing anything, verify your context:

1. **MANIFEST INTEGRITY.** Every file listed in the context manifest header is actually present in the context below. If any listed file is missing, FAIL immediately — do not start the review.
2. **UNRESOLVED IMPORTS.** Scan the diff for imports that reference files not in your context. Note them — they are blind spots. If a concern depends on code in a blind-spot file, FAIL with a clear reason naming the file.
3. **SUFFICIENCY.** Judge whether the context you have is enough to review safely. If the diff touches files whose behavior depends heavily on files not provided, and you cannot verify correctness without them, FAIL before starting.

## PROCESS FEEDBACK

After the verdict, optionally include one line of feedback about the checklist itself — questions that didn't apply, questions that were unclear, or patterns observed in the diff that no question covers. This feedback does NOT affect the PASS/FAIL verdict. It is collected across all three Council firings and surfaced once in the step 18 retrospective.
