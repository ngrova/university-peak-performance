# Plan: Fix Council Agent Prompts — Multi-Codebase Awareness

## TYPE
PIPELINE-INFRA

## Task
The Code Review Council applies thriving-mobile rules to fleet-sync-server code, causing false rejections. PR #179 was falsely rejected because the security agent demanded `auth.getUser()` checks and session-based RLS patterns on a server that uses API key middleware and service-role keys. Add codebase context sections to all 4 agent prompts so they detect which codebase the diff belongs to and apply the correct rules.

## Approach
1. Add a "Codebase Context" section near the top of each agent prompt (after the infrastructure exemption, before the checklist)
2. The section tells agents to check file paths in the diff to determine codebase
3. For `fleet-sync-server/` files: API key auth, service-role Supabase, no auth.getUser(), no Sentry (JSON-RPC errors), unit tests only
4. For `apps/thriving-mobile/` files: all existing rules apply as-is
5. Per-file application when a PR touches both codebases
6. Add a note to agent-3 about gitignored/local-only files not requiring rejection for being absent from the diff

## Files to Change
- `.claude/review-agents/agent-1-security-data-integrity.md` — add codebase context section
- `.claude/review-agents/agent-2-code-quality-standards.md` — add codebase context section
- `.claude/review-agents/agent-3-correctness-integration.md` — add codebase context section + gitignored file note
- `.claude/review-agents/agent-4-reliability-testing.md` — add codebase context section

## New Files
None.

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
- "Never remove or weaken review checks" — this change adds awareness, it does not weaken any existing checks for thriving-mobile code.

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #181

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
