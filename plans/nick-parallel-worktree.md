# Plan: Parallel Worktree Setup

## TYPE
PIPELINE-INFRA

## Task
Set up git worktrees so two Claude Code instances can run simultaneously without branch-switching conflicts. PR #177 already caused data loss when one instance switched branches while the other had uncommitted work. Add a parallel.bat script Nick can double-click to launch the second workspace, and document the workflow in CLAUDE.md.

## Approach
1. Worktree already created at ../upp-worktree-2 (done in pre-flight)
2. Create parallel.bat in repo root with error handling — checks worktree exists (creates if not), validates directory before launching, shows clear status messages. Note: parallel.bat is a convenience wrapper — the real safety comes from git branch isolation (two worktrees cannot share a branch) + pipeline hooks (require-plan, block-on-pushback) enforcing the full 17-step pipeline on each instance independently
3. Add parallel.bat to .gitignore (local workflow tool, not project code)
4. Add "Parallel Instances" section to CLAUDE.md with these rules: (a) primary workspace is this directory, parallel is ../upp-worktree-2, (b) two worktrees cannot share a branch — each instance creates its own nick/ branch with its own plan file, (c) each instance must independently complete the full 17-step pipeline including council plan review and council code review before creating a PR, (d) parallel.bat auto-creates the worktree if missing

## Files to Change
- .gitignore — add parallel.bat entry
- CLAUDE.md — add Parallel Instances section with worktree rules

## New Files
- parallel.bat — Windows batch script to launch parallel workspace (gitignored, local-only)

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
- 2026-03-23 Sub-Agent Pipeline Rule: PRs #127-129 bypassed council review when sub-agents used internal worktrees. This plan addresses it with three layers: (1) Git worktrees have independent file systems — each worktree on its own branch has its own plans/ directory, so plan files and council approvals are naturally isolated per instance. Instance A's PASS on plans/nick-feature-a.md does not carry over to instance B's plans/nick-feature-b.md. (2) Pipeline hooks (require-plan, block-on-pushback) enforce the 17-step pipeline identically in both directories. (3) The CLAUDE.md Parallel Instances section explicitly requires each instance to independently complete the full pipeline including council reviews before creating a PR.

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS (8/9 — Agent 6 rejected, escalated to human, overridden)
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PASS (docs-only change — authoritative review runs in GitHub Actions)
COUNCIL_CODE_REVIEW: PASS
