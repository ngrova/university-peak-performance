# Workflow

## The Pipeline — 20 Steps, 3 Phases

The user describes what they want in plain English. The system handles everything. No slash commands needed.

### Phase A: Before Code

1. **Human prompts** — Describes what they want.

2. **Pre-flight checks** — Before doing anything else:
   - Clean working tree: `git status --porcelain`. If dirty, commit or discard before proceeding.
   - Main CI health: `gh run list --branch main --limit 1 --json conclusion`. If failed, warn the human.
   - Open PRs: `gh pr list --state open --json number,title,headRefName,updatedAt`. If ANY open PRs exist, STOP. Present the list to the human (PR number, title, branch, age in days) and ask whether to close, merge, or leave them before starting new work. Do not proceed until the human answers. Record the decision in the plan's `## Open PRs Addressed` section.

3. **Pre-plan pushback declaration** — Before planning begins, you MUST declare whether you have concerns about the requested approach. This is mandatory — not optional. Set the `PUSHBACK-PREPLAN` field in the plan file. It starts as `UNDECLARED` which blocks all progress. Change it to `CLEAR-{branch-name}` (no concerns) or `CONCERNS` (describe each concern and STOP — Nick must resolve before work continues). See the plan template's inline instructions for full details.

4. **Create feature branch** — `git fetch origin && git checkout -b nick/short-description origin/main`. No other prefixes. Verify with `git merge-base --is-ancestor origin/main HEAD && echo OK` — if not OK, recreate from origin/main.

5. **Plan creation** — Write `plans/{branch-slug}.md` using the template below.

6. **Council plan review** (local) — Fire all 7 review agents in parallel on the plan. Fix rejections, re-run until all agents PASS. Set `RESULT: PASS` in the plan. Surface the full structured receipt to Nick as a notification — not a gate. Keep working.

7. **Present to human** — Show the plan and Council results. Wait for the human to say "build it." Set `STATUS: CONFIRMED` only after explicit approval.

### Phase B: Writing Code

8. **Build** — Write code on the feature branch. Hooks enforce: require-plan, block-on-pushback, block-infra-edit (Write/Edit); block-dangerous, block-on-pushback, require-ci-pass (Bash). Plus any project-specific hooks from settings.json.

9. **Post-build pushback declaration** — After all code is written, you MUST declare whether concerns surfaced during implementation. This is mandatory — not optional. Set the `PUSHBACK-POSTBUILD` field in the plan file. It starts as `UNDECLARED` which blocks the code review. Change it to `CLEAR-PR-{number}` (no concerns) or `CONCERNS` (describe each concern and STOP). See the plan template's inline instructions for full details.

10. **Council code review** (local, advisory) — Fire all 7 review agents in parallel on the diff. Fix rejections. Surface the full structured receipt to Nick as a notification — not a gate. Keep working. This is fast feedback — the authoritative review runs in GitHub Actions.

### Phase C: Ship

11. **Create PR** — Conventional commit title. Include what/why/how-to-test. Commit the plan file. Get CI run link AFTER the final push: `gh run list --limit 1 --json url --jq '.[0].url'`.

12. **Monitor CI** — Use `gh run watch` or poll with `gh run view`. Report all-pass or which jobs failed. Do not start new work until CI status is known.

13. **External code review** (GitHub Action, hard gate) — Runs automatically. Independent Council review with all 7 agents. Must pass to merge. If rejected, read the PR comment, fix, push — Action re-runs. The plan stays `STATUS: CONFIRMED` during this phase so fixes can be pushed; require-plan continues to permit edits until the PR merges.

14. **CI** (hard gate) — Tests, lint, typecheck, E2E, dead code check. Must pass to merge.

15. **Merge** — Auto-merge proceeds when both external review and CI pass. Run `gh pr merge --auto` so the human doesn't have to visit GitHub.

16. **Lock the plan** — After merge succeeds, set `STATUS: COMPLETED — PR #[number]`. This consumes the approval — require-plan blocks further edits until a new plan is confirmed. Locking happens post-merge (not post-PR-creation) so the branch can still be edited to address external review rejections or CI failures.

17. **Deploy monitoring** — After merge, confirm deploy succeeds. A merge that doesn't deploy is not done.

17b. **Clean Workbench** — After deploy confirms, run the Clean Workbench Protocol in full (Step 17b detailed section above): verify PR MERGED on GitHub, reset local `main` via `git fetch origin main && git checkout -B main origin/main` (the `-B` form slips past the `block-dangerous.js` checkout-main regex), force-delete this PR's branch with `git branch -D <branch>`, `git remote prune origin`, sweep orphan local branches, then verify clean state. If any step fails, STOP and report. Do not proceed to Step 18 with a lingering feature branch or orphan branches.

18. **Post-PR retrospective** — This is mandatory. Write a retrospective to `ngrova/pipeline` at `retros/<project>/<YYYY.MM.DD>_pr<N>_<slug>.md`. Include a link to the Council JSON artifact for this PR (the `council-ledger` artifact on the external review workflow run; 90-day retention). Review your entire PR cycle from plan through merge using this structure:

    **Review Cycle Summary**
    - Plan review passes: [count — how many rounds before the Council approved the plan]
    - Local code review passes: [count]
    - External Council passes: [count — how many pushes before the GitHub Action approved]
    - Total cycles: [sum]

    **What the pipeline caught (working as intended)**
    List each rejection that found a real bug — a problem that would have shipped broken or insecure. For each: which agent, what it caught, why it mattered. These are wins. If the pipeline caught nothing real, write "Clean pass — no real issues caught." Do not fabricate catches.

    **What was pipeline friction (needs improvement)**
    List each rejection or delay caused by the pipeline itself — rule ambiguity, tooling bugs, missing context, hallucinated concerns, process bottlenecks, hook conflicts. These are NOT code bugs you wrote. These are problems the pipeline caused. For each:
    - What happened
    - Root cause (why the pipeline behaved this way)
    - Suggested fix (what should change in the pipeline, and which file)
    If no friction: "Clean run — no pipeline friction encountered."

    **If I could restart this PR**
    What would you do differently knowing what you know now? Different plan structure, different approach, different file organization? If nothing: "No changes — approach was correct."

    **Recommended pipeline improvements**
    If you were to make change(s) to improve the pipeline to produce higher quality code and products, more reliably, what change(s) would you make? State what and why. If nothing: "No recommendations."

    **Council process feedback**
    [Aggregated from all three Council firings (steps 6, 10, 13). Include any agent observations about the checklist itself — questions that didn't apply, were unclear, or patterns the questions don't cover. If no agent had feedback: "None."]

19. **Present retrospective** — Present your retrospective to the human in the terminal: "Here's my feedback on the pipeline for this PR. If you'd like, you can send this to Paul." Do not ask a question — just present the feedback and let the human decide.

20. **Commit retrospective to pipeline repo** — Commit the retrospective file to `ngrova/pipeline` with message `retro(<project>): pr<N> <slug>`. Direct commit to main — no PR, no Council review. If the commit fails (network, auth, repo unreachable), STOP and report to the human with the retrospective body printed inline so no feedback is lost.

## Plan File Template

Plan files live in `plans/{branch-slug}.md` (slug = branch name with `/` → `-`). Committed to branches so the GitHub Action can read them.

Every gate variable has an inline instruction block. These instructions are part of the template — they ship with every plan file. They exist so you cannot change a variable without reading what changing it requires.

