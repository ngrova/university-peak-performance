# Delegation — Authority Matrix

This file defines what Claude Code can and cannot do in this project. The SessionStart hook injects it at session start. If this file is missing, the hook hard-fails — the session cannot start.

## Rules

1. **Default: Claude-driven.** If a CLI command can be run non-interactively with flags, Claude runs it without asking.
2. **Silver-platter only when human-only interaction is required.** Browser OAuth flows, manual dashboard steps, or anything the CLI cannot automate.
3. **Ask-first for destructive or provisioning operations.** Draft the command, present it to Nick, run only after explicit confirmation.

## Services

| Service | Link | Provision | Destroy | Configure | Read |
|---------|------|-----------|---------|-----------|------|
| Supabase | Claude-driven (`supabase link --project-ref kemmvxnmlmvspfxgfvhl`) | Ask-first | Ask-first | Claude-driven | Claude-driven |
| Netlify | Claude-driven (`netlify link --id 9dca72b9-6e6d-4d82-a428-d206245ba358`) | Ask-first | Ask-first | Claude-driven | Claude-driven |
| GitHub | Claude-driven (`gh` CLI, repo `ngrova/university-peak-performance`) | Ask-first (`gh repo create`) | Ask-first | Claude-driven | Claude-driven |
| Sentry | Silver-platter (browser auth, org `upp-wz`, project `thriving-mobile`) | Silver-platter (wizard) | Ask-first | Silver-platter | Claude-driven (via API token) |
| Stripe | Silver-platter (`stripe login` — browser OAuth) | Silver-platter | Ask-first | Claude-driven (via CLI) | Claude-driven |
| Anthropic Claude API | Claude-driven (app runtime) | Silver-platter (key creation) | Ask-first | Claude-driven | Claude-driven |
| Deepgram | Claude-driven (app runtime speech-to-text) | Silver-platter (key creation) | Ask-first | Claude-driven | Claude-driven |

## Status

| Service | Current State |
|---------|--------------|
| Supabase | Provisioned (project `thriving-app`, ref `kemmvxnmlmvspfxgfvhl`, us-east-2, Micro, B2BBHS org). Linked. |
| Netlify | Provisioned (site `thriving-mobile`, id `9dca72b9-6e6d-4d82-a428-d206245ba358`, team `nicholas-grover`). Linked. |
| GitHub | Provisioned (`ngrova/university-peak-performance`, private). Branch protection configured; required checks to be reconciled with canonical: `CI`, `Code Review Council`. |
| Sentry | Project `thriving-mobile` reserved in org `upp-wz`. Wizard not yet run — DSN TBD. Run `npx @sentry/wizard@latest -i nextjs` in `apps/thriving-mobile/`. |
| Stripe | Test-mode keys not yet seeded. Webhook scaffolded but NOT registered — deferred to first payment-flow feature branch. |
| Anthropic Claude API | Provisioned as GitHub secret `ANTHROPIC_API_KEY` (Council reviews) and Netlify env `ANTHROPIC_API_KEY` (runtime). |
| Deepgram | Key provisioned as Netlify env `DEEPGRAM_API_KEY` for speech-to-text transcription. |

## Provisioning

Any creation or destruction of cloud resources on Nick's paid accounts is **Ask-first**. The `block-redlisted-ops` hook enforces this as a hard gate — it blocks `supabase projects create/delete`, `netlify sites:create/delete`, `gh repo create/delete`, and `stripe *--live*` commands automatically. To proceed, draft the exact command, present it to Nick as a silver-platter, and wait for explicit "confirmed" before running.

Provisioning IS already complete for the services above — do not re-provision. If a plan genuinely requires a new cloud resource (additional Supabase project, separate Netlify site, new repo), that's PIPELINE-INFRA work: write a plan with TYPE: PIPELINE-INFRA, present the provisioning command to Nick, and run only after approval.

## Environment Variables

Standard pipeline set (seeded at bootstrap): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`, `SENTRY_DSN` (TBD), `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`.

UPP-specific additions: `DEEPGRAM_API_KEY` (speech-to-text transcription).

All values live in Netlify env (production) and `.env.local` (local). Never commit `.env.local`. Never hardcode secrets in code.

## Drift Prevention

When a new external service dependency appears in a plan (new import, new API call, new CLI command):
1. Check this file. If the service is listed, follow the authority column.
2. If the service is NOT listed, STOP. Ask Nick: "This plan introduces [service]. How should I handle it? Should I add it to DELEGATION.md?"
3. Never add a service to this file without Nick's approval — this is a PIPELINE-INFRA change.
