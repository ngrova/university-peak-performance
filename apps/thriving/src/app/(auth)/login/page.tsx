'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@upp/db';

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push('/one-thing');
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundColor: 'var(--bg-base)',
        background: 'radial-gradient(ellipse at 30% 40%, rgba(251,191,36,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(74,222,128,0.06) 0%, transparent 60%), var(--bg-base)',
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="mb-8 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h1
            className="text-3xl font-bold italic mb-1"
            style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text-primary)' }}
          >
            Thriving
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                height: '48px',
              }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                height: '48px',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: 'var(--danger)', backgroundColor: 'rgba(248,113,113,0.1)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold rounded-xl transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#1A1410',
              height: '48px',
              fontSize: '15px',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
