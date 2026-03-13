# AI Session Protocol

> **FOR ANY AI ASSISTANT WORKING WITH NICK:** Read this document at the start of every
> session. These are the rules for how you operate.

## Communication Rules

**SLOW DOWN.** This is a conversation, not a dump truck.

* **One question at a time.** Never stack multiple questions in one response.
* **One instruction at a time.** Give Nick a single command to run, wait for the result.
* **State the goal, then the action.** Every response that involves doing something should follow this format:

  > **Goal:** [The big picture thing we're working toward]
  >
  > **Next:** [The one small thing to do right now]

* Keep answers concise. Nick communicates informally, often via voice input.
* Always specify which machine/terminal a command should run on.
* Don't over-explain. If Nick needs more context, he'll ask.
* Nick has a 9:30 PM Eastern hard stop every night.

## Context Rewind Protocol

Long conversations degrade AI performance. Monitor for these signals:
- Chat is getting long (50+ exchanges)
- Nick says "rewind", "fresh start", "new chat", or similar
- You notice your own responses getting less sharp
- Image upload limits are hit

**When a rewind is triggered (by Nick or by you), you MUST do these things IN ORDER before ending:**

1. **Update DECISIONS_LOG.md** — Add all new decisions, deferred items, and completed TODOs
2. **Draft the git push block** — Give Nick the full `cat > ... ENDOFFILE` + `git add/commit/push` block for ALL updated docs (DECISIONS_LOG.md, AI_SESSION_PROTOCOL.md, and any other changed docs). Nick pastes this into Mac Mini SSH terminal (nick user, `~/university-peak-performance` directory).
3. **Write the rewind prompt** — A single self-contained message Nick can paste to replace his first message in the chat. This prompt MUST contain:
   - The full text of AI_SESSION_PROTOCOL.md (embedded, not linked)
   - The full text of DECISIONS_LOG.md (embedded, not linked)
   - What day/task we're on
   - Exactly where we left off (last completed step)
   - What's next (first step of the new session)
   - Which terminal/user/directory to be in
   - Any open issues or blockers

**How Nick does a rewind:** He scrolls to his first message in the chat, clicks edit, replaces it with the rewind prompt, and sends. That's it — one action, zero memory required. The Mission Briefing stays attached as an uploaded file.

Nick should be productive in the new timeline within 2 minutes.

## Session Startup Checklist

When Nick starts a new session and uploads the Mission Briefing + DECISIONS_LOG.md:

1. Read both documents completely
2. Identify current day/task from the decisions log
3. Check Deferred / TODO for anything blocking current work
4. Confirm with Nick where he left off (one question)
5. Resume execution

## Document Update Rules

At the end of every session (or at context rewind), update DECISIONS_LOG.md with:
- New decisions made (dated, one line each)
- New deferred items added to the TODO section  
- Completed TODO items moved to their date section and marked done
- Any "we'll do that later" statements captured in Deferred / TODO

## Key File Locations

* **Repo:** `~/university-peak-performance` (nick user on Mac Mini)
* **OpenClaw config:** `/Users/openclaw/.openclaw/openclaw.json`
* **OpenClaw workspace:** `/Users/openclaw/.openclaw/workspace/`
* **Gateway logs:** `/tmp/openclaw/gateway-stdout.log`
* **SSH alias:** `ssh macmini` from Windows PC PowerShell
* **Governance docs:** `~/university-peak-performance/docs/`
