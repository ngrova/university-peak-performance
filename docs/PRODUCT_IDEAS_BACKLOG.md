# Product Ideas Backlog

> **Purpose**: Capture product ideas as they come up so nothing gets lost.
> These are NOT committed to — they're ideas waiting for the right time.
> When Nick decides to build one, it moves to a proper ARCHITECTURE.md.

---

## Idea 1: Leadership Daily Report Aggregator

**Date captured**: 2026-03-04
**Company**: Back to Basics (behavioral health)
**Classification**: Internal business tool (potentially productizable later)

### The Problem

Nick has high-level leaders across Back to Basics. He needs visibility
into what's happening across the organization without scheduling
meetings or chasing people down. Leaders need to know what other
departments are doing without reading everyone else's raw updates.

### The Concept

An AI-powered daily reporting system that:

1. **Collects**: Texts each leader at a set time with tailored questions
   (e.g., "What did your team accomplish today?" "Any blockers?"
   "Anything Nick needs to know?")

2. **Aggregates**: Leaders reply via text. The AI collects all responses
   and builds a unified picture of the organization's day.

3. **Distributes**: Generates personalized daily reports for each leader
   (and Nick) containing:
   - Only the information relevant to THEIR role
   - Formatted in the style THEY prefer
   - AI judgment on what's important vs. FYI
   - Cross-department connections ("Sarah's team is blocked on
     something John's team could help with")

4. **Learns**: Over time, the AI learns what each person cares about,
   what format they prefer, and what information is actually useful.

### Key Features (Brainstorm)

- SMS/text-based (not another app to install)
- Customizable question sets per leader/role
- Configurable timing (end of day, morning standup, weekly)
- AI-generated executive summary for Nick
- Per-person filtered views
- Flag urgent items that need immediate attention
- Historical trend tracking ("this team has had blockers 3 days in a row")

### Questions to Answer Later

- What messaging channel? (SMS, WhatsApp, Signal, Telegram?)
- How much AI judgment vs. raw reporting?
- Should leaders see each other's raw responses or only AI summaries?
- How does this integrate with existing Back to Basics systems?
- Is this an OpenClaw skill, a standalone app, or something else?
- Could this become a product for other behavioral health companies?

### Tech Considerations

- OpenClaw already supports multi-channel messaging (SMS, WhatsApp,
  Telegram, Signal) — this could potentially be an OpenClaw skill
- Could leverage the same Mac Mini infrastructure
- AI summarization is a strong use case for Claude API
- SMS integration might be the simplest channel for non-technical leaders

### Status: Idea captured. Not started.

---

## Idea 2: [Next idea goes here]

---

## How to Use This File

- When Nick has an idea, add it here with the date and basic concept.
- Don't overdesign at this stage — just capture enough to remember later.
- When ready to build, create a proper ARCHITECTURE.md and move it
  to the active development queue.
- Ideas can be for any company/brand (Back to Basics, University of
  Peak Performance, personal tools).

---

Last updated: 2026-03-04
