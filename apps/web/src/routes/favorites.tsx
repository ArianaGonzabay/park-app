import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { API_ENDPOINTS, DataState, PageHeader, Panel, apiFetch, useApiQuery } from './shared'

type Favorite = {
  id: string
  name: string
  address: string
  availableSpots: number
  hourlyRate: number
}

type FavoritesResponse = {
  favorites: Favorite[]
}

export function FavoritesPage() {
  const { data, isLoading, error } = useApiQuery<FavoritesResponse>(
    'favorites',
    API_ENDPOINTS.favorites
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const favorites = data?.favorites ?? []
  const hasData = favorites.length > 0

  const handleRemove = (id: string) => {
    void (async () => {
      setActionError(null)
      const response = await apiFetch(`${API_ENDPOINTS.favorites}/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        setActionError('Unable to remove favorite')
      }
    })()
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Favorite garages"
        description="Save preferred locations for faster booking and instant pricing."
      />
      <Panel title="Saved locations" description={`Endpoint: ${API_ENDPOINTS.favorites}`}>
        <div className="space-y-4">
          <DataState
            isLoading={isLoading}
            hasData={hasData}
            error={error}
            loadingLabel="Loading favorite garages and availability."
            emptyLabel="No favorites yet. Add one from the map view."
          />
          {favorites.map((spot) => (
            <div
              key={spot.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200"
            >
              <div>
                <p className="text-base font-semibold text-slate-100">{spot.name}</p>
                <p className="text-xs text-slate-400">{spot.address}</p>
                <p className="mt-2 text-xs text-slate-300">
                  {spot.availableSpots} spots · ${spot.hourlyRate.toFixed(2)} / hr
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/reserve/$id"
                  params={{ id: spot.id }}
                  className="rounded-full border border-emerald-300/60 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
                >
                  Reserve
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(spot.id)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {actionError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {actionError}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
