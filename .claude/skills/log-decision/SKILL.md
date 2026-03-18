---
name: log-decision
description: Appends an architectural decision to docs/DECISIONS_LOG.md with date, context, decision, and rationale. Use after any architectural choice, technology selection, or pattern decision.
user_invocable: true
---

# log-decision

Log an architectural decision to the project's decision log.

## Step 1 — Identify the Decision

Extract from the conversation:
- What was decided
- Why it was decided (the driving constraint or reason)
- What alternatives were considered

## Step 2 — Append to Decision Log

Read `docs/DECISIONS_LOG.md`. Append a new entry at the bottom using this format:

```
### YYYY-MM-DD — [Short Decision Title]

**Context:** [One sentence — what problem or question prompted this decision]

**Decision:** [One sentence — what was decided]

**Rationale:** [1-3 sentences — why this option was chosen over alternatives]

**Alternatives considered:**
- [Alternative 1] — [why rejected]
- [Alternative 2] — [why rejected]
```

## Rules

- Use today's actual date, not a placeholder
- Keep each entry under 10 lines
- Never delete or modify existing entries
- If docs/DECISIONS_LOG.md doesn't exist, create it with a `# Decisions Log` header
