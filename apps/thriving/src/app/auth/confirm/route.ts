import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Support both 'next' and 'redirect_to' param names (Supabase uses redirect_to)
  const next = searchParams.get('next')
    ?? searchParams.get('redirect_to')
    ?? (type === 'recovery' ? '/update-password' : '/one-thing')

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`)
  }

  // Build the redirect response first so we can set cookies on it
  const redirectUrl = next.startsWith('http') ? next : `${origin}${next}`
  const response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { error } = await supabase.auth.verifyOtp({ type, token_hash })

  if (error) {
    console.error('Auth confirm error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=invalid_token`)
  }

  return response
}
