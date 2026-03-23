---
name: make-plan
description: Creates a branch-specific plan file (plans/{branch}.md) with approach, files to change, scope estimate, and STATUS field before any code is written. Use when starting any new feature, fix, or refactor — any task that will modify application code.
user_invocable: true
---

# make-plan

Create a branch-specific plan file for the requested feature or fix. Follow these steps:

## Step 1 — Understand the Request

Read the user's plain-English description carefully. If anything is ambiguous, ask ONE clarifying question before proceeding.

## Step 2 — Analyze the Codebase

Use Glob, Grep, and Read tools to understand the current code relevant to this task. Identify:
- Which files need to change
- Which existing components, hooks, or utilities can be reused
- Which new files need to be created
- Check `docs/DESIGN-REGISTRY.md` for canonical UI patterns — use them instead of building new versions
- Note if any registry entries need updating as part of this plan

## Step 3 — Write the plan file

Determine the plan file path: get the current git branch name, replace `/` with `-`, and write to `plans/{slug}.md`. For example, branch `nick/fix-foo` → `plans/nick-fix-foo.md`. Create the `plans/` directory if it doesn't exist.

Write the plan file using this exact format:

```
# Plan: [Feature Name]

## TYPE
[FEATURE | REDESIGN — defaults to FEATURE if omitted]

## Task
[The user's plain-English description, quoted verbatim]

## Approach
[2-5 bullet points explaining how to build it]

## Files to Change
- path/to/file.tsx — what changes and why

## New Files
- path/to/new-file.tsx — what it does (skip this section if none)

## Files to Delete
- path/to/old-file.tsx — replaced by [new file] (REDESIGN only; skip for FEATURE)

## Scope
[small (1-3 files) / medium (4-7 files) / large (8+ files)]

## STATUS: PENDING
```

## Step 4 — Present the Plan

Tell the user:
- What you're going to build (one sentence)
- How many files are affected
- The scope estimate

Then ask: **"Want me to go ahead with this plan?"**

## Step 5 — On Approval

When the user approves, update the plan file to change `STATUS: PENDING` to `STATUS: APPROVED`. This unlocks the require-plan hook so code can be written.

## Rules

- Never start writing application code before the plan file has STATUS: APPROVED
- Keep the plan concise — no more than 40 lines for FEATURE, 60 lines for REDESIGN (deletion lists need space)
- TYPE defaults to FEATURE if omitted — only set REDESIGN when the primary intent is replacing, consolidating, or removing existing code
- REDESIGN plans must list every file being removed in "Files to Delete" with a one-line reason
- If scope is "large", suggest breaking it into smaller pieces
- Each branch gets its own plan file — no shared PLAN.md. The plans/ directory is gitignored so plan files never reach main
