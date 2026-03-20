// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (login)
// PURPOSE: The sign-in screen — email and password form. On
//   success, sends the user to the Today tab. Shows errors
//   inline if credentials are wrong.
// CALLED BY: Next.js framework (automatic — this is the /login route);
//   also linked from signup/page.tsx
// DATA FLOW: User types email + password → form submits →
//   Supabase auth checks credentials → success redirects to
//   /today, failure shows error message
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@upp/db';
import InputField from '@/components/InputField';

/**
 * Triggered by: user navigates to /login (or middleware redirects
 *   unauthenticated users here).
 * Steps: renders email and password inputs. On submit, calls
 *   Supabase signInWithPassword. If auth fails, shows the error
 *   message inline. If auth succeeds, navigates to /today.
 * Returns: the login form UI.
 */
export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** User taps "Sign in" → validates with Supabase → redirects or shows error */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push('/today');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div
        className="w-full max-w-sm rounded-xl p-6"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <h1 className="text-2xl font-bold text-center mb-1" style={{ color: 'var(--text-primary)' }}>
          Thriving
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          Welcome back
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Email" id="login-email" type="email" value={email} onChange={setEmail} />
          <InputField label="Password" id="login-pw" type="password" value={password} onChange={setPassword} />
          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ color: 'var(--danger)', backgroundColor: 'rgba(232,72,72,0.1)' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold rounded-lg transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: '#0A0A0F', height: '48px' }}
          >
            {loading ? 'Signing in\u2026' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          No account?{' '}
          <Link href="/signup" style={{ color: 'var(--accent)' }} className="font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
