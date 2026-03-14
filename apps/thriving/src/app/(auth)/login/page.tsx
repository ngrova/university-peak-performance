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

    router.push('/dashboard');
  }

  const inputClass =
    'mt-1 block w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400';

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundColor: '#1a1512',
        background: 'radial-gradient(ellipse at 30% 40%, rgba(217,119,6,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(20,184,166,0.08) 0%, transparent 60%), #1a1512',
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1
            className="text-4xl font-bold italic mb-1"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#FAF7F2' }}
          >
            Thriving
          </h1>
          <p className="text-xs uppercase tracking-widest text-amber-400/80"
            style={{ fontFamily: 'var(--font-nunito)' }}>
            Ensure Nick is Thriving
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70">Email</label>
            <input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70">Password</label>
            <input id="password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#2D2318', color: '#FAF7F2' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-sm text-white/50 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-amber-400 hover:text-amber-300">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
