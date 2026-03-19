# Plan: Fix server action Supabase client — use getAll/setAll with try/catch

## Task
"Fix server actions so Today screen shows tasks and Capture saves successfully. The @upp/db get/set/remove cookie pattern doesn't work reliably with @supabase/ssr@0.5.2 on Netlify."

## Approach
- Create Supabase client directly from @supabase/ssr using getAll/setAll (same API the working middleware uses)
- Wrap setAll in a try/catch so it doesn't crash when cookieStore.set() throws in Netlify serverless
- Pass env vars directly (not through @upp/db's process.env indirection)
- Add try/catch to today-actions.ts fetch functions so errors don't crash the server action stream

## Files to Change
- `apps/thriving-mobile/src/lib/supabase-server.ts` — use @supabase/ssr directly with getAll/setAll + try/catch

## Scope
small (1 file)

## STATUS: APPROVED
