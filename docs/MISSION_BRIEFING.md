# MISSION BRIEFING: University of Peak Performance — AI Development System

> **What this document is**: The complete context for setting up Nick's autonomous
> AI development pipeline. Hand this to any AI assistant to get execution support.
> All strategic decisions have been made. This is about execution now.
>
> **Created**: March 12, 2026
> **Status**: Mac Mini purchased. Ready for Day 1 setup.

---

## 1. THE INTENT

Nick is building a fully functional AI development team that lives on a Mac Mini.
Not a toy. Not an experiment. A real, working team that produces real software.

Some of that software is for Nick — tools like the Silver Trading System that
solve his own problems. But the bigger purpose is to build applications that
help other people in meaningful ways. Thriving isn't just a task app — it's
designed to help people organize their lives around what actually matters to
them and take action on it.

The University of Peak Performance exists because Nick believes he can create
software that makes a genuine impact in people's lives. The AI development
pipeline is the means to that end. It's what lets one person with a clear
vision build at the scale of a team, without needing to hire one.

This isn't about automation for its own sake. It's about removing the
bottleneck between having an idea that could help people and actually
shipping it. Every governance doc, every tool choice, every architectural
decision exists to serve that purpose: get meaningful software into the
hands of people who need it, built the right way, as fast as possible.

---

## 2. WHO IS NICK

Nick is the CEO of Back to Basics Behavioral Health Services (NH/ME). Separately,
he's building a future venture called **University of Peak Performance** — a
software company (not yet formalized) that will produce SaaS products.

He is a solo "vibe coder" — he directs AI agents in plain English to write code.
He has experience with React, Git, Supabase, PowerShell, and Cursor IDE. He works
on Windows 11 as his daily driver. He has a hard stop at 9:30 PM Eastern every night.

His Chief of Staff is Erin Wilson.

---

## 3. THE MISSION

Build an autonomous AI development pipeline where Nick can:

1. Message a Coder agent in plain English via Slack
2. The agent reads governance docs, writes code, writes tests, creates a GitHub PR
3. Automated tools (Greptile, Snyk, Qodo, GitHub Actions) review every PR
4. Nick does final review and merges

This replaces the need for a development team. One AI agent writes code.
Purpose-built SaaS tools review it. Nick approves it.

---

## 4. WHAT WE'RE BUILDING

### Two Applications (in priority order)

**Thriving** — Task management app organized around Life Pillars (Health, Career,
Family, etc.). Hierarchical: Pillars → Goals → Tasks → Subtasks (one level only).
Features a "One Thing Mode" that surfaces the single highest-priority task.
**Classification: Commercial SaaS product.**

**Silver Trading System** — Precious metals ETF rotation tool (AGQ/SLV/GLD).
Rule-based rotation strategy with exponential position sizing. Generates
recommendations — does NOT auto-trade. Nick executes trades manually.
**Classification: Internal tool (Nick only, not for sale).**

### The Leadership Daily Report Aggregator (Future — Backlog Only)
An AI system that texts leaders daily questions, aggregates responses, and
distributes personalized reports. This is for Back to Basics, not UPP.
**Status: Idea captured. Not started. Do not build yet.**

---

## 5. DECISIONS MADE (DO NOT REVISIT)

Every decision below was carefully evaluated. Do not second-guess these.

### Hardware
- **Mac Mini M4 Pro, 48GB RAM, 512GB SSD** — purchased, in hand
- Runs headless (no monitor after initial setup)
- Connected via Ethernet for reliability
- Accessories needed: Ethernet cable, UPS battery backup (~$50), HDMI dummy plug (~$10)

### Agent Platform
- **OpenClaw** — open-source AI agent platform, runs as a Node.js gateway
- Single **Coder agent** to start (not multi-agent initially)
- Reference: Brian Casel's (Builder Methods) OpenClaw multi-agent setup on YouTube
  is the key architecture reference for how this should eventually look

### Chat Interface
- **Slack** — chosen over Telegram (better markdown, threaded replies)
- Each agent gets its own Slack bot
- Nick messages agents from his Windows PC or phone

### AI Models
- **Claude API routed through OpenRouter** (not direct Anthropic API)
- OpenRouter provides: model flexibility, cost tracking, multi-provider access
- Default model: **Claude Sonnet** (cost-efficient for most tasks)
- Heavy reasoning tasks: **Claude Opus** (use sparingly)
- Nick's personal Claude Max subscription stays separate for his own use

### Automated PR Review Gauntlet
These tools auto-review every PR on GitHub. No manual triggering needed.

| Tool | Role | Cost | Setup |
|------|------|------|-------|
| **Greptile** | Code review (full codebase context) | $30/mo | Connect GitHub repo, upload GLOBAL_STANDARDS.md as rules |
| **Snyk** | Security scanning, dependency vulnerabilities | Free | Connect GitHub repo |
| **Qodo** | Test coverage suggestions | Free | Connect GitHub repo |
| **GitHub Actions** | CI/CD — runs tests, linting, type checks | Free | Create workflow YAML in repo |
| **Vercel** | Auto-deploy on merge, preview deploys on PRs | Free | Connect GitHub repo |

### Tech Stack
| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) — Nick has existing projects |
| Hosting | Vercel |
| Client State | Zustand |
| Server State | TanStack Query |
| Testing | Vitest + Playwright |
| Monorepo | Turborepo |
| Repo Name | `university-peak-performance` (private) |

### Repo Structure
```
university-peak-performance/
├── apps/
│   ├── thriving/          # Next.js app
│   └── silver-trading/    # Next.js app
├── packages/
│   ├── ui/                # Shared components (shadcn/ui)
│   ├── db/                # Supabase client + types
│   ├── config/            # Shared ESLint, Tailwind, TS configs
│   └── utils/             # Shared utilities
├── docs/
│   ├── GLOBAL_STANDARDS.md
│   ├── OPENCLAW_WORKFLOW.md
│   ├── PRODUCT_IDEAS_BACKLOG.md
│   ├── decisions.md
│   ├── thriving/
│   │   └── ARCHITECTURE.md
│   └── silver-trading/
│       └── ARCHITECTURE.md
└── .github/
    └── workflows/
        └── ci.yml
```

### Security Model (Treat Agents Like Employees)
- Mac Mini runs under a dedicated `openclaw` user account
- Agents get their own GitHub account (invited to specific repos only, revocable)
- Agents get their own email address (for service signups)
- Nick's personal machine has NO agent access
- Shared files only via synced folders (consider Dropbox approach like Brian Casel)
- No SSH keys stored in agent memory — use ssh-agent
- If compromised: revoke all credentials, rebuild machine

### Future Plans (Not Now)
- Custom task management dashboard (Kanban board like Brian Casel built)
- Multi-agent team (developer, marketer, assistant, sysadmin)
- Local AI models via Ollama (the 48GB RAM supports this when ready)
- Leadership Daily Report Aggregator (Back to Basics tool)

---

## 6. CODING STANDARDS (Summary)

Full details in GLOBAL_STANDARDS.md. Key points:

- **Sandi Metz style**: Files ≤100 lines, functions ≤25 lines, ≤4 params
- **Explicit over implicit**: Named options objects, no magic booleans
- **Single source of truth**: Derived data is computed, never stored
- **Props down, events up**: No prop drilling beyond 2 levels
- **Every PR gets tests**: No exceptions
- **Server Components by default**: `'use client'` only when needed

---

## 7. GOVERNANCE DOCUMENTS

Six governance documents have been created. They should be uploaded to the
`docs/` folder in the GitHub repo. Nick has downloaded copies of all six.

1. **GLOBAL_STANDARDS.md** — Master coding standards (Coder reads this first)
2. **OPENCLAW_WORKFLOW.md** — Coder agent operating procedures
3. **THRIVING_ARCHITECTURE.md** — Thriving app data model, routes, features
4. **SILVER_TRADING_ARCHITECTURE.md** — Silver Trading calculations, data model
5. **PRODUCT_IDEAS_BACKLOG.md** — Captured ideas (Leadership Report is first entry)
6. **30_DAY_LAUNCH_PLAN.md** — Day-by-day action plan (see Section 7)

---

## 8. THE 30-DAY PLAN (Summary)

### Week 1: Foundation (Days 1-7)
- Day 1: Configure macOS headless (SSH, Screen Sharing, auto-login, Ethernet)
- Day 2: Install toolchain (Homebrew, Node.js, Git, GitHub CLI), create repo, push docs
- Day 3: Install OpenClaw, connect Claude via OpenRouter, connect Slack
- Day 4: Configure Coder agent (SOUL.md, AGENTS.md, USER.md)
- Day 5: Connect automated tools (Greptile, Snyk, Qodo, GitHub Actions)
- Day 6: First real task ("Initialize the Turborepo monorepo")
- Day 7: Review and adjust

### Week 2: Thriving MVP (Days 8-14)
- Supabase setup, auth flow, life pillars, goals, tasks, One Thing mode
- Deploy to Vercel on Day 13

### Week 3: Polish + Silver Trading Start (Days 15-21)
- Thriving dashboard and polish
- Silver Trading init, calculation engine, position sizing

### Week 4: Silver Trading + Pipeline Maturity (Days 22-30)
- Trade logging, price dashboard, strategy editor
- Pipeline optimization, Lobster workflow exploration
- Month 1 retrospective

---

## 9. MONTHLY COSTS

| Item | Cost |
|------|------|
| Claude API via OpenRouter | ~$50-100/mo |
| Greptile (code review) | $30/mo |
| Snyk (security) | Free |
| Qodo (test suggestions) | Free |
| GitHub Actions (CI/CD) | Free |
| Vercel (hosting) | Free |
| Slack (messaging) | Free |
| **Total ongoing** | **~$80-130/mo** |

**Cost warning**: Brian Casel spent $200 in API costs in his first 2 days of setup.
Start with Sonnet as the default model. Only use Opus when you need deep reasoning.

---

## 10. KEY REFERENCES

- **Brian Casel (Builder Methods)** — YouTube video "My Multi-Agent Team with OpenClaw"
  His architecture: Mac Mini M4, multi-agent via Slack, OpenRouter for model routing,
  custom Rails dashboard for task management, shared workspace with "Brain Folder",
  Dropbox sync for file sharing between personal machine and agent machine.

- **Gustavo Gondim** — DEV.to article "How I Built a Deterministic Multi-Agent Dev
  Pipeline Inside OpenClaw" — used Lobster (OpenClaw's workflow engine) for a
  code → review → test loop with sub-workflow looping. Used Opus for programmer
  agent, Sonnet for reviewer. Key insight: "Don't orchestrate with LLMs. Use them
  for creative work, use code for plumbing."

- **OpenClaw docs**: https://docs.openclaw.ai
- **OpenClaw GitHub**: https://github.com/openclaw/openclaw
- **OpenClaw multi-agent docs**: https://docs.openclaw.ai/concepts/multi-agent

---

## 11. HOW TO USE THIS DOCUMENT

**For a fresh AI instance helping Nick with setup:**

1. Read this entire document first.
2. Nick has the Mac Mini in hand and is ready for Day 1.
3. Walk him through setup step-by-step, one command at a time.
4. He's on Windows 11 as his daily driver, SSHing into the Mac Mini.
5. He prefers tactical, outline-style explanations.
6. He communicates informally, often via voice input.
7. Keep answers concise — action items before context.
8. He has a 9:30 PM Eastern hard stop every night.
9. All strategic decisions are made. This is execution mode.
10. If something comes up that contradicts this document, flag it —
    but default to what's written here unless Nick says otherwise.

**For Nick returning to continue work:**

Upload this document at the start of any new chat about the OpenClaw project.
It gives the AI everything it needs to pick up where you left off.
Update Section 7 (the plan) as you complete days to track progress.

---

## 12. WHAT SUCCESS LOOKS LIKE

After 30 days, Nick should be able to:

1. Text a message to his Coder agent in Slack from his phone
2. The agent reads his governance docs and writes standards-compliant code
3. A PR appears on GitHub, auto-reviewed by Greptile, Snyk, Qodo
4. GitHub Actions runs the test suite
5. Vercel generates a preview deployment
6. Nick reviews the PR on his phone or PC, merges with one click
7. The app deploys to production automatically

That's the dream. Plain English in, production code out.

---

Last updated: 2026-03-12
