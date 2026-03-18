'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@upp/db';
import InputField from '@/components/InputField';

/** Signup page with email/password registration */
export default function SignupPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Handles form submission for sign-up */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signUp({
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
          Create your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Email" id="signup-email" type="email" value={email} onChange={setEmail} />
          <InputField label="Password" id="signup-pw" type="password" value={password} onChange={setPassword} />
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
            {loading ? 'Creating account\u2026' : 'Sign up'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)' }} className="font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
