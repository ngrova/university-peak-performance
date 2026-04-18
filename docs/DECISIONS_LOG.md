# DECISIONS LOG

At end of every session, update this with new decisions, deferred items, completed TODOs.
Push to repo: github.com/ngrova/university-peak-performance

## March 12, 2026

- Tailscale chosen for remote access (free, no port forwarding needed). Mac Mini: 100.89.233.15, Windows PC: 100.67.121.73
- Tailscale set to start on login for headless reliability
- Signed into Tailscale via GitHub (ngrova)

## March 13, 2026

- SSH config alias created on Windows PC: ssh macmini connects to Mac Mini via Tailscale IP
- SSH key auth configured (ed25519) — no password needed to connect
- Desktop shortcut "Mac Mini SSH" created on Windows PC for one-click access
- openclaw user account created (UID 502) for agent isolation per security model
- OpenClaw installed under openclaw user with local npm prefix (~/.npm-global)
- OpenClaw v2026.3.12 installed via npm install -g openclaw@latest
- OpenRouter chosen as model provider; $20 credits loaded; API key named openclaw-agent
- Default model set to openrouter/anthropic/claude-sonnet-4.6 (not auto) for cost control
- Gateway bound to loopback (127.0.0.1) only — not exposed to LAN
- Gateway auth set to token (auto-generated)
- Tailscale exposure set to off — gateway runs locally only
- Slack workspace created: "Nick Grover HQ" (free tier)
- Slack app created: "OpenClaw Coder" with Socket Mode enabled
- App-level token (xapp-) and Bot token (xoxb-) generated for Slack integration
- 20 bot token scopes configured (including channels:join, files:read/write, reactions, etc.)
- Bot events subscribed: app_mention, message.channels, message.im
- Slack groupPolicy set to "open" (allowlist blocked events; open fixed it)
- Nick's Slack user paired via pairing code VLX4PJB8
- session-memory hook enabled for context retention between sessions
- Gateway runs as LaunchDaemon (/Library/LaunchDaemons/ai.openclaw.gateway.plist) for headless reliability
- GitHub fine-grained PAT created (albus-agent, 90 days, Contents read/write, scoped to university-peak-performance repo)
- AI_SESSION_PROTOCOL.md created and pushed to repo
- Coder agent named "Albus" — first agent at Nick Grover HQ
- SOUL.md configured: software engineer + right-hand agent across all operations (UPP, Back to Basics, personal)
- USER.md configured: Nick's profile, communication style, 9:30 PM hard stop
- TOOLS.md configured: both machines, repo locations, services, Slack details
- IDENTITY.md configured: Albus, wizard emoji, direct/resourceful/opinionated
- BOOTSTRAP.md deleted (agent identity established)
- Slack bot renamed from "OpenClaw Coder" to "Albus"
- Git identity for openclaw user: "Albus (OpenClaw Agent)" / albus-agent@noreply.github.com
- System-level osxkeychain credential helper removed (was conflicting with store helper)
- Repo cloned to /Users/openclaw/university-peak-performance for agent use
- Branch/commit/push pipeline verified end-to-end
- Classic GitHub PAT created (albus-agent, 90 days, repo + read:org + workflow scopes) — replaced fine-grained PAT due to workflow scope limitation
- gh CLI authenticated for openclaw user
- Albus can self-merge PRs to develop via gh pr merge — no human PR review needed
- Branch protection rule added on develop: requires Lint, Type Check, Unit & Component Tests, E2E Tests to pass
- Auto-merge not available on free GitHub plan (requires Pro/Team/Enterprise) — Albus self-merges instead
- PR #1 merged: GitHub Actions CI workflow for Turborepo monorepo
- GO_TO_MARKET.md created and pushed: Thriving app 4-phase strategy (dogfood → content → beta → launch)
- Greptile deferred ($30/mo) — not needed until codebase is large enough that Nick can't review PRs himself
- PR gauntlet simplified to: GitHub Actions + Snyk + Qodo (all free)
- Albus instructed to manage his own context rewinds after ~50 exchanges
- MEMORY.md created in Albus workspace for persistent lightweight memory
- Monorepo scaffold in progress (subagent working)

## April 17, 2026

- **Decision: split `fleet-sync-server/` out of this repo.** The original vision — AIs using the MCP server to read Thriving data for greater context — is not yet realized. Today the MCP server is agent-to-agent messaging only (fleet inbox, fanout, batch post), with no consumption of Thriving's Supabase data. Co-location pays costs (shared lockfile, mixed CI, `fleet_*` migrations polluting `apps/thriving-mobile/supabase/migrations/`, Council review noise, a separate `fleet-sync-upp` Netlify site hanging off every Thriving PR) without the benefit of shared types/data. When the grand vision IS realized, the correct contract is the MCP API surface, not code-level imports.
- Plan: new repo `ngrova/fleet-sync`. Move `fleet-sync-server/` and the `fleet_messages` / `fleet_inbox` / `fleet_agents` Supabase migrations over. Keep the fleet tables in the same Supabase project (`thriving-app` / `kemmvxnmlmvspfxgfvhl`) — cheaper than a second project, and gives Thriving an easy data-level read path later if needed. Re-point the `fleet-sync-upp` Netlify site at the new repo. Delete from this repo once migration is verified.
- Scope estimate: ~1-2 days (new repo, its own pipeline adoption, Netlify re-point, Supabase migration ownership shuffle, docs update). Not urgent — Thriving's pipeline is already clean without this.

## Deferred / TODO

- [ ] Buy HDMI dummy plug (~$10) and UPS battery backup (~$50)
- [ ] Run openclaw security audit --deep and openclaw security audit --fix for full hardening
- [ ] Verify LaunchDaemon survives a full Mac Mini reboot
- [ ] Enable OpenClaw web search provider (skipped during onboarding)
- [ ] Review and install relevant OpenClaw skills as needed
- [ ] Configure DM pairing policy (left as default during onboarding)
- [ ] Set up Snyk integration on repo
- [ ] Set up Qodo integration on repo
- [ ] Delete old fine-grained PAT "claude-read-only" from GitHub (leaked, replaced)
- [ ] Delete old fine-grained PAT "albus-agent" from GitHub (replaced by classic)
- [ ] Execute fleet-sync split (see April 17, 2026 decision): new `ngrova/fleet-sync` repo, move `fleet-sync-server/` + `fleet_*` Supabase migrations, re-point `fleet-sync-upp` Netlify site, delete from this repo
