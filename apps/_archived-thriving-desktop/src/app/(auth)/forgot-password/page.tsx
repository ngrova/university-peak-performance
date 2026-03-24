'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@upp/db'

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://thriving-app.netlify.app'

export default function ForgotPasswordPage(): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createBrowserClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/auth/confirm?type=recovery&next=/update-password`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
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
            className="text-2xl font-bold italic mb-2"
            style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text-primary)' }}
          >
            Reset your password
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {sent
              ? `We sent a reset link to ${email}`
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {sent ? (
          <div
            className="rounded-xl p-4 text-center text-sm"
            style={{ backgroundColor: 'rgba(74,222,128,0.1)', color: 'var(--success)' }}
          >
            Check your email — the link expires in 1 hour.
          </div>
        ) : (
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
                placeholder="you@example.com"
                className="block w-full rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', height: '48px' }}
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
              style={{ backgroundColor: 'var(--accent)', color: '#1A1410', height: '48px', fontSize: '15px' }}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm"
            style={{ color: 'var(--text-muted)', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </main>
  )
}
