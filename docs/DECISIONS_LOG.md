# Decisions Log

> **FOR ANY AI ASSISTANT READING THIS:** This is a living document. At the end of every
> work session with Nick, you MUST update this file with:
> 1. New decisions made (dated, one line each)
> 2. New deferred items added to the TODO section
> 3. Completed TODO items moved to their date section and marked done
> 4. Any "we'll do that later" statements captured in Deferred / TODO
>
> Nick should not have to ask for this. Do it automatically before ending any session.
> Push the updated file to the repo: github.com/ngrova/university-peak-performance

Decisions made during setup that aren't in the original Mission Briefing. Each entry is dated and one line.

## March 12, 2026

* Tailscale chosen for remote access (free, no port forwarding needed). Mac Mini: 100.89.233.15, Windows PC: 100.67.121.73
* Tailscale set to start on login for headless reliability
* Signed into Tailscale via GitHub (ngrova)

## March 13, 2026

* SSH config alias created on Windows PC: `ssh macmini` connects to Mac Mini via Tailscale IP
* SSH key auth configured (ed25519) — no password needed to connect
* Desktop shortcut "Mac Mini SSH" created on Windows PC for one-click access
* `openclaw` user account created (UID 502) for agent isolation per security model
* OpenClaw installed under `openclaw` user with local npm prefix (~/.npm-global)
* OpenClaw v2026.3.12 installed via `npm install -g openclaw@latest`
* OpenRouter chosen as model provider; $20 credits loaded; API key named `openclaw-agent`
* Default model set to `openrouter/anthropic/claude-sonnet-4.6` (not auto) for cost control
* Gateway bound to loopback (127.0.0.1) only — not exposed to LAN
* Gateway auth set to token (auto-generated)
* Tailscale exposure set to off — gateway runs locally only
* Slack workspace created: "Nick Grover HQ" (free tier)
* Slack app created: "OpenClaw Coder" with Socket Mode enabled
* App-level token (`xapp-`) and Bot token (`xoxb-`) generated for Slack integration
* 20 bot token scopes configured (including channels:join, files:read/write, reactions, etc.)
* Bot events subscribed: app_mention, message.channels, message.im
* Slack groupPolicy set to "open" (allowlist blocked events; open fixed it)
* Nick's Slack user paired via pairing code VLX4PJB8
* session-memory hook enabled for context retention between sessions
* Gateway runs as LaunchDaemon (`/Library/LaunchDaemons/ai.openclaw.gateway.plist`) for headless reliability
* GitHub fine-grained PAT created (`claude-read-only`, 90 days, Contents read/write, scoped to university-peak-performance repo)
* HDMI dummy plug and UPS still not purchased (carried forward)

## Deferred / TODO

* Buy HDMI dummy plug (~$10) and UPS battery backup (~$50)
* Rename Slack app from "OpenClaw Coder" to "OpenClaw" — bot is the platform, not just one agent
* Run `openclaw security audit --deep` and `openclaw security audit --fix` for full hardening
* Verify LaunchDaemon survives a full Mac Mini reboot
* Slack browser DM still broken (cached "sending messages turned off") — desktop app works fine, low priority
* Enable OpenClaw web search provider (skipped during onboarding)
* Review and install relevant OpenClaw skills as needed
* Configure DM pairing policy (left as default during onboarding)
