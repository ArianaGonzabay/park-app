import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

import { API_ENDPOINTS, DataState, PageHeader, Panel, useApiQuery } from './shared'

type ParkingSpot = {
  id: string
  name: string
  address: string
  location: { lat: number; lng: number }
  availableSpots: number
  hourlyRate: number
  type: string
}

type ParkingSearchResponse = {
  parkingSpots: ParkingSpot[]
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export function MapPage() {
  const { data, isLoading, error } = useApiQuery<ParkingSearchResponse>(
    'parking-search',
    API_ENDPOINTS.parkingSearch
  )
  const parkingSpots = data?.parkingSpots ?? []
  const hasData = parkingSpots.length > 0

  const mapCenter = useMemo<LatLngExpression>(() => {
    const firstSpot = parkingSpots[0]
    if (firstSpot) {
      return [firstSpot.location.lat, firstSpot.location.lng]
    }
    return [-0.2, -78.49]
  }, [parkingSpots])

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <PageHeader
        title="Find a calm place to park"
        description="Search by neighborhood, time window, and vehicle type. Map pins will surface live capacity."
        actions={
          <>
            <Link
              to="/favorites"
              className="rounded-full border border-emerald-300/60 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
            >
              View favorites
            </Link>
          </>
        }
      />
      <Panel title="Search filters" description="Real-time pricing and availability ahead.">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-slate-300">
            Destination
            <input
              type="text"
              placeholder="Downtown, Mission, Waterfront"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Arrival time
            <input
              type="time"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Duration
            <select className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none">
              <option>1 hour</option>
              <option>2 hours</option>
              <option>Half day</option>
              <option>Full day</option>
            </select>
          </label>
          <button
            type="button"
            className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900"
          >
            Run search
          </button>
        </div>
      </Panel>
      <section className="lg:col-span-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live map</p>
              <h3 className="font-display text-2xl text-slate-50">Nearby parking inventory</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
              {API_ENDPOINTS.parkingSearch}
            </span>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              <MapContainer center={mapCenter} zoom={13} className="h-[360px] w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {parkingSpots.map((spot) => (
                  <Marker key={spot.id} position={[spot.location.lat, spot.location.lng]}>
                    <Popup>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{spot.name}</p>
                        <p className="text-xs text-slate-600">{spot.address}</p>
                        <p className="text-xs">{spot.availableSpots} spots available</p>
                        <p className="text-xs">${spot.hourlyRate.toFixed(2)} / hr</p>
                        <Link
                          to="/parking/$id"
                          params={{ id: spot.id }}
                          className="text-xs font-semibold text-emerald-600"
                        >
                          View details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <div className="space-y-4">
              <DataState
                isLoading={isLoading}
                hasData={hasData}
                error={error}
                loadingLabel="Loading nearby garages and live capacity."
                emptyLabel="No active results yet. Search to reveal parking inventory."
              />
              {parkingSpots.map((spot) => (
                <div
                  key={spot.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-100">{spot.name}</p>
                      <p className="text-xs text-slate-400">{spot.address}</p>
                    </div>
                    <Link
                      to="/reserve/$id"
                      params={{ id: spot.id }}
                      className="rounded-full border border-emerald-300/60 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
                    >
                      Reserve
                    </Link>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
                    <span>{spot.availableSpots} spots</span>
                    <span>${spot.hourlyRate.toFixed(2)} / hr</span>
                    <span className="uppercase">{spot.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
