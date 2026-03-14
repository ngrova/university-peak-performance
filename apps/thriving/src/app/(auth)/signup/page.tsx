'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@upp/db';

export default function SignupPage(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();

    const { data: allowed } = await supabase
      .from('allowed_emails')
      .select('email')
      .eq('email', email)
      .single();

    if (!allowed) {
      setError('This email is not authorized to create an account. Contact Nick to request access.');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({ email, password });

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
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70">Confirm password</label>
            <input id="confirmPassword" type="password" required value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#2D2318', color: '#FAF7F2' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-white/50 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300">Sign in</Link>
        </p>
        <p className="mt-6 text-xs text-white/30 text-center">
          Access is by invitation only. Contact{' '}
          <a href="mailto:nicholas.grover@b2bbhs.com" className="hover:text-white/50">Nick Grover</a>{' '}
          to request access.
        </p>
      </div>
    </main>
  );
}
