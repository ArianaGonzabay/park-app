import { useState } from 'react'

import { API_ENDPOINTS, DataState, PageHeader, Panel, apiFetch, useApiQuery } from './shared'

type PartnerParking = {
  id: string
  name: string
  availableSpots: number
  totalSpots: number
}

type PartnerParkingResponse = {
  parking: PartnerParking[]
}

export function PartnerAvailabilityPage() {
  const { data, isLoading, error } = useApiQuery<PartnerParkingResponse>(
    'partner-availability',
    API_ENDPOINTS.partnerParking
  )
  const parking = data?.parking ?? []
  const hasData = parking.length > 0
  const [status, setStatus] = useState<string | null>(null)

  const handleUpdate = (id: string, availableSpots: number) => {
    void (async () => {
      setStatus(null)
      const response = await apiFetch(API_ENDPOINTS.partnerAvailability(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableSpots }),
      })
      setStatus(response.ok ? 'Availability updated' : 'Availability update failed')
    })()
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Availability control"
        description="Set live capacity, block-outs, and surge windows per garage."
      />
      <Panel title="Capacity settings" description={`Endpoint: ${API_ENDPOINTS.partnerParking}`}>
        <div className="space-y-4">
          <DataState
            isLoading={isLoading}
            hasData={hasData}
            error={error}
            loadingLabel="Loading capacity and blackout data."
            emptyLabel="No capacity rules configured yet."
          />
          {parking.map((spot) => (
            <div
              key={spot.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200"
            >
              <div>
                <p className="text-base font-semibold text-slate-100">{spot.name}</p>
                <p className="text-xs text-slate-400">
                  {spot.availableSpots} / {spot.totalSpots} available
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUpdate(spot.id, Math.max(spot.availableSpots - 1, 0))}
                className="rounded-full border border-emerald-300/60 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
              >
                Decrease by 1
              </button>
            </div>
          ))}
          {status && (
            <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
              {status}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
