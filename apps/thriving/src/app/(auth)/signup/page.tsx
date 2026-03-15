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
      setError('This email is not authorized. Contact Nick to request access.');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/one-thing');
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    height: '48px',
  };

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
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'email', label: 'Email', type: 'email', value: email, onChange: setEmail, placeholder: 'you@example.com' },
            { id: 'password', label: 'Password', type: 'password', value: password, onChange: setPassword, placeholder: '••••••••' },
            { id: 'confirmPassword', label: 'Confirm password', type: 'password', value: confirmPassword, onChange: setConfirmPassword, placeholder: '••••••••' },
          ].map(({ id, label, type, value, onChange, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </label>
              <input
                id={id}
                type={type}
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="block w-full rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                style={inputStyle}
              />
            </div>
          ))}

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: 'var(--danger)', backgroundColor: 'rgba(248,113,113,0.1)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: '#1A1410', height: '48px', fontSize: '15px' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
        <p className="mt-4 text-xs text-center" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          Access is by invitation only.
        </p>
      </div>
    </main>
  );
}
