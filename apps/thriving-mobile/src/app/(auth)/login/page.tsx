'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@upp/db';
import InputField from '@/components/InputField';

/** Login page with email/password auth */
export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Handles form submission for sign-in */
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
