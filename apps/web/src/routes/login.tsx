import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { API_ENDPOINTS, PageHeader, Panel } from './shared'
import { setTokens } from '../lib/auth'

type LoginResponse = {
  accessToken: string
  refreshToken: string
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void (async () => {
      try {
        setStatus('loading')
        setError(null)
        const response = await fetch(API_ENDPOINTS.login, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!response.ok) {
          throw new Error('Invalid email or password')
        }
        const data = (await response.json()) as LoginResponse
        setTokens(data.accessToken, data.refreshToken)
        setStatus('success')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to sign in')
        setStatus('error')
      }
    })()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <PageHeader
        title="Welcome back"
        description="Sign in to your driver account to manage reservations, favorites, and vehicle details."
        actions={
          <>
            <span className="rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
              POST {API_ENDPOINTS.login}
            </span>
            <Link
              to="/signup"
              className="rounded-full border border-emerald-300/60 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
            >
              Create account
            </Link>
          </>
        }
      />
      <Panel title="Driver login" description="Use email + password for now.">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-slate-300">
            Email address
            <input
              type="email"
              placeholder="you@park.app"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            disabled={!email || !password || status === 'loading'}
          >
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </button>
          {status === 'success' && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Login successful. Navigate to the map to start booking.
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
          <div className="text-xs text-slate-400">
            Password resets will route to the auth service later.
          </div>
        </form>
      </Panel>
    </div>
  )
}
