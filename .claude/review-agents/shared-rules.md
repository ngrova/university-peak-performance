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

