// ═══════════════════════════════════════════════════════════
// FILE: middleware.ts
// PURPOSE: The app's security gate — runs before every page load
//   to check if the user is logged in. If not, redirects them to
//   the login page. Public pages (login, signup) skip the check.
// CALLED BY: Next.js framework (automatic — runs on every request)
// DATA FLOW: Browser request → middleware reads auth cookies →
//   Supabase verifies the session → allowed through or redirected
//   to /login
// ═══════════════════════════════════════════════════════════
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/auth/confirm'];

/**
 * Triggered by: Next.js runs this automatically on every page request.
 * Steps: checks if the URL is a public path (login, signup, etc.) —
 *   if so, lets it through. Otherwise, creates a Supabase client
 *   from the request cookies, calls getUser() to verify the session,
 *   and redirects to /login if no valid user is found.
 * Returns: NextResponse.next() to allow the request, or a redirect.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-).*)'],
};
