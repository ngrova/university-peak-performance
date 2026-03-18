# Plan: Phase 0 — Scaffold thriving-mobile PWA

## Task
"Read docs/MOBILE-REBUILD-SPEC.md. Build Phase 0 — Scaffold. When deployed and added to an iPhone home screen, it opens fullscreen with no browser chrome, shows a dark background with a bottom tab bar (5 tabs), no pinch-to-zoom, and feels like a native app — even though every screen is just a placeholder."

## Approach
- Create `apps/thriving-mobile/` as a new Next.js App Router app in the monorepo with TypeScript strict, Tailwind CSS, and wired to shared packages (`@upp/db`, `@upp/ui`, `@upp/utils`)
- Configure full PWA: manifest.json (`display: standalone`), all Apple meta tags (apple-mobile-web-app-capable, status-bar-style black-translucent, theme-color #0A0A0F), viewport with `user-scalable=no, viewport-fit=cover`
- Set up dark theme CSS variables per spec (#0A0A0F background, #1A1A2E surface, #E8A838 accent, system font stack) and globals.css
- Build a bottom tab bar component (Today/Tasks/Capture/Goals/Tree) with Lucide icons, safe-area-inset-bottom padding, and 5 placeholder screens
- Wire auth middleware reusing existing Supabase auth pattern, plus login/signup pages styled to the new dark theme
- Add Netlify config for separate `thriving-mobile` site deployment

## Files to Change
- `netlify.toml` — add mobile app build context (or separate netlify config)

## New Files
- `apps/thriving-mobile/package.json` — app package with deps
- `apps/thriving-mobile/next.config.mjs` — Next.js config with transpilePackages
- `apps/thriving-mobile/tsconfig.json` — extends base, path alias @/*
- `apps/thriving-mobile/tailwind.config.ts` — extends base + mobile content paths
- `apps/thriving-mobile/postcss.config.js` — tailwind + autoprefixer
- `apps/thriving-mobile/.eslintrc.json` — next/core-web-vitals
- `apps/thriving-mobile/public/manifest.json` — PWA manifest (standalone, icons)
- `apps/thriving-mobile/src/app/layout.tsx` — root layout with all PWA meta tags
- `apps/thriving-mobile/src/app/globals.css` — dark theme CSS variables per spec
- `apps/thriving-mobile/src/app/providers.tsx` — QueryClientProvider wrapper
- `apps/thriving-mobile/src/app/(app)/layout.tsx` — app shell with bottom tab bar
- `apps/thriving-mobile/src/app/(app)/today/page.tsx` — placeholder
- `apps/thriving-mobile/src/app/(app)/tasks/page.tsx` — placeholder
- `apps/thriving-mobile/src/app/(app)/goals/page.tsx` — placeholder
- `apps/thriving-mobile/src/app/(app)/tree/page.tsx` — placeholder
- `apps/thriving-mobile/src/app/(app)/capture/page.tsx` — placeholder (redirect target)
- `apps/thriving-mobile/src/components/BottomTabBar.tsx` — 5-tab bar with Lucide icons
- `apps/thriving-mobile/src/app/(auth)/login/page.tsx` — login page, dark theme
- `apps/thriving-mobile/src/app/(auth)/signup/page.tsx` — signup page, dark theme
- `apps/thriving-mobile/src/middleware.ts` — auth guard reusing Supabase SSR pattern

## Scope
large (20+ files — but all are small scaffold files, most under 50 lines)

## STATUS: APPROVED
