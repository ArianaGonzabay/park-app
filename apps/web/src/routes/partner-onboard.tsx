import { useState } from 'react'

import { API_ENDPOINTS, PageHeader, Panel, apiFetch } from './shared'

export function PartnerOnboardPage() {
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void (async () => {
      setStatus('loading')
      const response = await apiFetch(API_ENDPOINTS.partnerOnboard, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, contactName }),
      })
      setStatus(response.ok ? 'success' : 'error')
    })()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <PageHeader
        title="Partner onboarding"
        description="Collect garage details, payout routing, and compliance checks."
        actions={
          <span className="rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
            POST {API_ENDPOINTS.partnerOnboard}
          </span>
        }
      />
      <Panel title="Partner intake" description="We will automate document checks.">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-slate-300">
            Operator name
            <input
              type="text"
              placeholder="Company or property name"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Primary contact
            <input
              type="text"
              placeholder="Operator name"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={!companyName || !contactName || status === 'loading'}
            className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 disabled:bg-slate-700 disabled:text-slate-300"
          >
            {status === 'loading' ? 'Submitting…' : 'Submit for review'}
          </button>
          {status === 'success' && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Partner onboarding received.
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              Unable to submit onboarding.
            </div>
          )}
        </form>
      </Panel>
    </div>
  )
}
