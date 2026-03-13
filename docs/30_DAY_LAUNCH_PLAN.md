# University of Peak Performance — 30-Day Launch Plan

> **Goal**: Go from unboxing a Mac Mini to having a working AI development
> pipeline that writes, reviews, and ships code via GitHub PRs.
>
> **Hardware**: Mac Mini M4 Pro / 48GB RAM / 512GB SSD (~$1,599)
> **AI Model**: Claude API (all cloud, no local models initially)
> **Operator**: Nick (solo, messaging from Windows 11 PC or phone)

---

## Architecture Summary

```
Nick → Telegram/Signal → OpenClaw (Mac Mini)
                              ↓
                     Coder Agent (Claude API)
                     Reads docs → writes code → creates PR
                              ↓
              ┌─── AUTOMATED PR GAUNTLET ───┐
              │  Greptile    (code review)   │
              │  Snyk        (security)      │
              │  Qodo        (test coverage) │
              │  GitHub Actions (CI/CD)      │
              │  Vercel      (preview deploy)│
              └──────────────────────────────┘
                              ↓
                   Nick reviews → merges
```

**Monthly Cost**: ~$80-130 (Claude API ~$50-100 + Greptile $30)
**Free Tools**: Snyk, Qodo, GitHub Actions, Vercel (free tiers)

---

## Week 1: Foundation (Days 1-7)

Goal: Mac Mini running, OpenClaw connected, Coder agent responding.

### Day 1 — Unbox and Configure macOS (2 hours)

- [ ] Unbox Mac Mini, connect to temporary monitor/keyboard/mouse
- [ ] Complete macOS setup (Apple ID, preferences)
- [ ] Enable Remote Login (SSH) in System Settings → Sharing
- [ ] Enable Screen Sharing (VNC) in System Settings → Sharing
- [ ] Enable auto-login in System Settings → Users & Groups
- [ ] Set "Start up automatically after power failure" in Energy settings
- [ ] Connect Ethernet cable to router
- [ ] Note the Mac Mini's IP address
- [ ] From Windows PC, test SSH: `ssh your-username@[mac-mini-ip]`
- [ ] Plug in HDMI dummy plug for clean Screen Sharing resolution
- [ ] Disconnect monitor/keyboard/mouse — Mac Mini is now headless

### Day 2 — Install Core Software (1.5 hours, via SSH)

- [ ] Install Homebrew
- [ ] Install Node.js 22+: `brew install node@22`
- [ ] Install Git: `brew install git`
- [ ] Install GitHub CLI: `brew install gh`
- [ ] Authenticate GitHub: `gh auth login`
- [ ] Configure Git identity (name + email)
- [ ] Create GitHub repo: `gh repo create university-peak-performance --private`
- [ ] Clone locally and set up directory structure:
  ```
  university-peak-performance/
  ├── apps/
  │   ├── thriving/
  │   └── silver-trading/
  ├── packages/
  │   ├── ui/
  │   ├── db/
  │   ├── config/
  │   └── utils/
  └── docs/
      ├── GLOBAL_STANDARDS.md
      ├── OPENCLAW_WORKFLOW.md
      ├── decisions.md
      ├── thriving/
      │   └── ARCHITECTURE.md
      └── silver-trading/
          └── ARCHITECTURE.md
  ```
- [ ] Upload governance docs, commit, push

### Day 3 — Install OpenClaw + Connect Messaging (2 hours)

- [ ] Install OpenClaw: `curl -fsSL https://openclaw.ai/install.sh | bash`
- [ ] Run onboarding: `openclaw onboard`
- [ ] Connect Claude API key (Anthropic API)
- [ ] Set default model to Claude Sonnet (cheaper for setup/testing)
- [ ] Connect messaging channel (Telegram or Signal recommended)
- [ ] Send first message — verify the agent responds
- [ ] Celebrate: you have an AI agent running on your own hardware

### Day 4 — Configure the Coder Agent (2 hours)

- [ ] Edit `~/.openclaw/SOUL.md`:
  ```markdown
  You are Coder, the development agent for University of Peak Performance.
  You write clean, tested, standards-compliant code.

  Before every task:
  1. Read ~/university-peak-performance/docs/GLOBAL_STANDARDS.md
  2. Read ~/university-peak-performance/docs/OPENCLAW_WORKFLOW.md
  3. Read the relevant ARCHITECTURE.md for the target app

  You follow Sandi Metz style: short files (≤100 lines),
  single responsibility, explicit over implicit.
  You always write tests. You never skip steps.
  ```
- [ ] Edit `~/.openclaw/USER.md` with info about Nick
- [ ] Edit `~/.openclaw/AGENTS.md` pointing to governance docs
- [ ] Restart OpenClaw
- [ ] Test: "What coding standards do you follow?" — verify it references your docs

### Day 5 — Connect Automated Tools (1.5 hours)

- [ ] **Greptile**: Sign up at greptile.com, connect GitHub repo
  - Upload GLOBAL_STANDARDS.md as custom rules
  - Enable auto-review on all PRs
  - 14-day free trial, then $30/mo

- [ ] **Snyk**: Sign up at snyk.io (free tier)
  - Connect GitHub repo
  - Enable automatic PR scanning
  - Enable dependency vulnerability alerts

- [ ] **Qodo**: Sign up at qodo.ai (free tier)
  - Connect GitHub repo
  - Enable test coverage suggestions on PRs

- [ ] **GitHub Actions**: Create `.github/workflows/ci.yml`:
  ```yaml
  name: CI
  on: [pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: '22' }
        - run: npm ci
        - run: npm run lint
        - run: npm run typecheck
        - run: npm run test
  ```

### Day 6 — First Real Task (2 hours)

- [ ] Message Coder: "Initialize the Turborepo monorepo for University of
  Peak Performance. Create the basic structure with apps/thriving,
  apps/silver-trading, packages/ui, packages/db, packages/config,
  packages/utils. Follow GLOBAL_STANDARDS.md."
- [ ] Watch it create a PR
- [ ] See Greptile, Snyk, Qodo comments appear on the PR
- [ ] Review the automated feedback
- [ ] If Coder needs to fix things, tell it what the tools flagged
- [ ] Merge when clean

### Day 7 — Rest + Review (30 minutes)

- [ ] Review everything from the week
- [ ] Start `docs/decisions.md` with any decisions made
- [ ] Note what went well and what to adjust
- [ ] Plan Week 2 tasks

---

## Week 2: Thriving MVP — Data Layer (Days 8-14)

Goal: Auth, database tables, and basic CRUD for Thriving.

### Day 8 — Supabase + Auth

- [ ] Task: "Set up the Supabase client in packages/db. Create types,
  client initialization, and helpers. Follow GLOBAL_STANDARDS.md 4.3."
- [ ] Manually: Configure Supabase project connection details
- [ ] Task: "Build auth flow for Thriving: login, signup, protected routes,
  session management via Supabase Auth. Follow THRIVING_ARCHITECTURE.md."

### Day 9 — Life Pillars

- [ ] Task: "Create Supabase migration for life_pillars table per
  THRIVING_ARCHITECTURE.md 3.1. Include RLS policies per 3.2."
- [ ] Run migration against Supabase
- [ ] Task: "Build pillar management UI: dashboard with all pillars,
  create/rename/reorder/archive. Follow component size guide 5.4."

### Day 10 — Goals

- [ ] Task: "Create goals table migration + CRUD functions. Build the
  goals page within a pillar — tap a pillar, see goals."
- [ ] Let automated tools review, fix any issues

### Day 11 — Tasks

- [ ] Task: "Create tasks table migration + CRUD. Build task management
  page: create, edit, complete, reorder tasks within a goal.
  Include subtask support (one level only)."

### Day 12 — One Thing Mode

- [ ] Task: "Build One Thing Mode per the algorithm in
  THRIVING_ARCHITECTURE.md section 7. Full-screen focused view."

### Day 13 — Deploy to Vercel

- [ ] Create Vercel account, connect GitHub repo
- [ ] Deploy Thriving app (Vercel auto-detects Next.js)
- [ ] Set environment variables (Supabase URL, anon key)
- [ ] Enable preview deployments on PRs
- [ ] Verify the deployed app works end-to-end

### Day 14 — Week 2 Review

- [ ] Test the deployed Thriving app thoroughly
- [ ] Update `docs/decisions.md` with new decisions
- [ ] Refine SOUL.md and AGENTS.md based on two weeks of experience
- [ ] Plan Week 3

---

## Week 3: Thriving Polish + Silver Trading Start (Days 15-21)

Goal: Polish Thriving, start Silver Trading.

### Day 15 — Thriving Dashboard

- [ ] Task: "Build the dashboard page: pillar overview with progress
  indicators, quick-add task, upcoming due dates."

### Day 16 — Thriving Polish

- [ ] Task: "Add loading states, error states, and empty states to all
  pages. Ensure mobile responsiveness (iPhone-first design)."

### Day 17 — Thriving Edge Cases

- [ ] Task: "Add drag-and-drop reordering for pillars, goals, and tasks.
  Handle all edge cases: empty lists, single items, etc."

### Day 18 — Silver Trading: Init + Auth

- [ ] Task: "Initialize the Silver Trading app in apps/silver-trading.
  Set up Next.js, basic layout, and single-user auth flow.
  Follow SILVER_TRADING_ARCHITECTURE.md."

### Day 19 — Silver Trading: Calculation Engine

- [ ] Task: "Build the rotation calculation engine as pure functions with
  comprehensive tests. Follow SILVER_TRADING_ARCHITECTURE.md section 6.
  This is core business logic — 100% test coverage required."
- [ ] Compare test scenarios with existing HTML app behavior

### Day 20 — Silver Trading: Position Sizing

- [ ] Task: "Build the exponential position sizing calculator and
  interactive curve visualization using Recharts. Section 6.2."

### Day 21 — Week 3 Review

- [ ] Review all code and automated tool feedback patterns
- [ ] Are Greptile's reviews useful? Adjust custom rules if needed.
- [ ] Is Snyk catching real issues or just noise? Tune if needed.
- [ ] Update governance docs based on what you've learned

---

## Week 4: Silver Trading + Pipeline Maturity (Days 22-30)

Goal: Finish Silver Trading MVP, refine the pipeline.

### Day 22 — Silver Trading: Trade Logging

- [ ] Database tables for positions, signals, trades
- [ ] Trade logging UI + signal history page

### Day 23 — Silver Trading: Price Dashboard

- [ ] Current prices display with manual refresh
- [ ] Price history storage in Supabase

### Day 24 — Silver Trading: Strategy Editor

- [ ] Strategy parameters CRUD
- [ ] Deploy Silver Trading to Vercel

### Day 25 — Pipeline Optimization

- [ ] Review: How many PR cycles does it take for clean code?
- [ ] Tune Coder's SOUL.md to pre-empt common Greptile complaints
- [ ] Add any new custom rules to Greptile based on patterns
- [ ] Optimize GitHub Actions workflow speed

### Day 26 — Explore Lobster Automation

- [ ] Read OpenClaw's Lobster workflow documentation
- [ ] Create a simple workflow: task → code → auto-create PR
- [ ] Goal: reduce manual steps in the pipeline

### Day 27-28 — Catch-Up and Polish

- [ ] Fix any outstanding issues in either app
- [ ] Improve test coverage where Qodo flagged gaps
- [ ] Address any Snyk security findings

### Day 29 — Both Apps End-to-End Testing

- [ ] Test Thriving: full user flow from signup to One Thing mode
- [ ] Test Silver Trading: full flow from login to trade logging
- [ ] Both apps on Vercel, both clean on all automated tools

### Day 30 — Month 1 Retrospective

- [ ] Update all governance docs based on what you've learned
- [ ] Compile `docs/decisions.md` — now rich with context
- [ ] Write a "State of the Project" summary:
  - What's working?
  - What tools are earning their keep?
  - What should Month 2 focus on?
  - Should we explore local models for cost savings?
  - Is it time to add QA.tech for E2E testing?

---

## What You'll Have After 30 Days

1. **Mac Mini** running 24/7 as your AI development server
2. **OpenClaw** with a configured Coder agent (Claude API)
3. **Automated PR gauntlet**: Greptile + Snyk + Qodo + GitHub Actions
4. **Thriving app** — functional MVP (pillars, goals, tasks, One Thing mode)
5. **Silver Trading System** — calculation engine, position sizing, trade logging
6. **Both apps deployed** to Vercel with preview deployments on PRs
7. **GitHub repo** with governance docs, decision log, clean history
8. **A workflow** where you message in plain English and get reviewed PRs back

---

## Daily Time Commitment

| Week | Daily Time | What You're Doing |
|------|-----------|-------------------|
| Week 1 | 1.5-2 hours | Setup, configuration, learning |
| Week 2 | 1-1.5 hours | Sending tasks, reviewing PRs |
| Week 3 | 1-1.5 hours | Sending tasks, tuning tools |
| Week 4 | 1 hour | Sending tasks, reviewing PRs, retrospective |

This fits within your 9:30 PM hard stop. Send a task in the morning,
review the PR in the evening.

---

## Monthly Cost Summary

| Item | Cost |
|------|------|
| Mac Mini M4 Pro 48GB/512GB | $1,599 (one-time) |
| Accessories (cable, UPS, HDMI plug) | ~$70 (one-time) |
| Claude API (Coder agent) | ~$50-100/mo |
| Greptile (code review) | $30/mo |
| Snyk (security scanning) | Free |
| Qodo (test suggestions) | Free |
| GitHub Actions (CI/CD) | Free |
| Vercel (hosting) | Free |
| **Month 1 total** | **~$1,750-1,800** |
| **Ongoing monthly** | **~$80-130** |

---

## Key Principles

1. **One agent, many tools.** The Coder writes code. Purpose-built tools review it.
2. **Small tasks.** Don't ask for "build the whole app." Break it into pieces.
3. **Trust the gauntlet.** If Greptile/Snyk/Qodo flag something, fix it.
4. **Journal every day.** What worked? What didn't? Feed it back into the docs.
5. **Review everything.** You are the final gate before merge.
6. **Settle by 9:30 PM.** Send tasks in the morning, review at night.

---

Last updated: 2026-03-04
Next review: End of Month 1
