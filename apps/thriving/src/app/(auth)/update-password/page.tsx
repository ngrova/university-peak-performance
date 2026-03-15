'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@upp/db'

export default function UpdatePasswordPage(): React.JSX.Element {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const supabase = createBrowserClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/one-thing'), 2000)
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    height: '48px',
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
            Set your new password
          </h1>
        </div>

        {success ? (
          <div
            className="rounded-xl p-4 text-center text-sm"
            style={{ backgroundColor: 'rgba(74,222,128,0.1)', color: 'var(--success)' }}
          >
            Password updated! Redirecting…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="block w-full rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                style={inputStyle}
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
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
