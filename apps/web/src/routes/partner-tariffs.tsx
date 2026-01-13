import { useState } from 'react'

import { API_ENDPOINTS, DataState, PageHeader, Panel, apiFetch, useApiQuery } from './shared'

type PartnerParking = {
  id: string
  name: string
}

type PartnerParkingResponse = {
  parking: PartnerParking[]
}

export function PartnerTariffsPage() {
  const { data, isLoading, error } = useApiQuery<PartnerParkingResponse>(
    'partner-tariffs',
    API_ENDPOINTS.partnerParking
  )
  const parking = data?.parking ?? []
  const hasData = parking.length > 0

  const [parkingId, setParkingId] = useState('')
  const [baseRate, setBaseRate] = useState(0)
  const [peakRate, setPeakRate] = useState(0)
  const [peakStart, setPeakStart] = useState('')
  const [peakEnd, setPeakEnd] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void (async () => {
      setStatus(null)
      const response = await apiFetch(API_ENDPOINTS.partnerTariffs(parkingId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseRate,
          peakRate: peakRate || undefined,
          peakStart: peakStart || undefined,
          peakEnd: peakEnd || undefined,
        }),
      })
      setStatus(response.ok ? 'Tariff saved' : 'Tariff update failed')
    })()
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Tariff management"
        description="Publish base rates, surge multipliers, and contract pricing."
      />
      <Panel title="Rate sheets" description={`Endpoint: ${API_ENDPOINTS.partnerParking}`}>
        <div className="space-y-4">
          <DataState
            isLoading={isLoading}
            hasData={hasData}
            error={error}
            loadingLabel="Loading tariff schedules."
            emptyLabel="No rate plans configured."
          />
          <form className="grid gap-3" onSubmit={handleSave}>
            <select
              value={parkingId}
              onChange={(event) => setParkingId(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            >
              <option value="">Select garage</option>
              {parking.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.name}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                placeholder="Base rate"
                value={baseRate}
                onChange={(event) => setBaseRate(Number(event.target.value))}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <input
                type="number"
                placeholder="Peak rate"
                value={peakRate}
                onChange={(event) => setPeakRate(Number(event.target.value))}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="time"
              placeholder="Peak start"
              value={peakStart}
              onChange={(event) => setPeakStart(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
            <input
              type="time"
              placeholder="Peak end"
              value={peakEnd}
              onChange={(event) => setPeakEnd(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900"
              disabled={!parkingId}
            >
              Save tariffs
            </button>
            {status && (
              <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
                {status}
              </div>
            )}
          </form>
        </div>
      </Panel>
    </div>
  )
}
