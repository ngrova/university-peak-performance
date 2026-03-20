import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSupabaseServerClient, createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

// Placeholder for generated database types (run supabase gen types later)
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export function createClient(): ReturnType<typeof createSupabaseClient<Database>> {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

interface CookieHandler {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: CookieOptions) => void;
  remove: (name: string, options: CookieOptions) => void;
}

// WARNING: This uses the get/set/remove cookie API. thriving-mobile code must NOT
// import this function — use getServerClient() from @/lib/supabase-server.ts instead,
// which uses the getAll/setAll API required by Netlify serverless.
export function createServerClient(
  cookies: CookieHandler,
): ReturnType<typeof createSupabaseServerClient<Database>> {
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies },
  );
}

export function createBrowserClient(): ReturnType<typeof createSupabaseBrowserClient<Database>> {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
