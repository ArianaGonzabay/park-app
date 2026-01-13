import { useState } from 'react'

import { API_ENDPOINTS, DataState, PageHeader, Panel, apiFetch, useApiQuery } from './shared'

type PartnerParking = {
  id: string
  name: string
  address: string
  availableSpots: number
  totalSpots: number
  hourlyRate: number
  type: string
}

type PartnerParkingResponse = {
  parking: PartnerParking[]
}

export function PartnerParkingPage() {
  const { data, isLoading, error } = useApiQuery<PartnerParkingResponse>(
    'partner-parking',
    API_ENDPOINTS.partnerParking
  )
  const parking = data?.parking ?? []
  const hasData = parking.length > 0

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [totalSpots, setTotalSpots] = useState(0)
  const [availableSpots, setAvailableSpots] = useState(0)
  const [hourlyRate, setHourlyRate] = useState(0)
  const [type, setType] = useState('covered')
  const [status, setStatus] = useState<string | null>(null)

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void (async () => {
      setStatus(null)
      const response = await apiFetch(API_ENDPOINTS.partnerParking, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          location: { lat: Number(lat), lng: Number(lng) },
          totalSpots,
          availableSpots,
          hourlyRate,
          type,
          amenities: [],
          images: [],
          operatingHours: {
            opensAt: '07:00',
            closesAt: '22:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          },
        }),
      })
      setStatus(response.ok ? 'Parking location created' : 'Unable to create location')
    })()
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Parking inventory"
        description="Manage each garage, update amenities, and publish availability."
      />
      <Panel title="Garage portfolio" description={`Endpoint: ${API_ENDPOINTS.partnerParking}`}>
        <div className="space-y-4">
          <DataState
            isLoading={isLoading}
            hasData={hasData}
            error={error}
            loadingLabel="Loading partner garage list."
            emptyLabel="No locations onboarded yet."
          />
          {parking.map((spot) => (
            <div
              key={spot.id}
              className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200"
            >
              <p className="text-base font-semibold text-slate-100">{spot.name}</p>
              <p className="text-xs text-slate-400">{spot.address}</p>
              <p className="mt-2 text-xs text-slate-300">
                {spot.availableSpots}/{spot.totalSpots} available · ${spot.hourlyRate.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Add location" description="Create a new partner garage.">
        <form className="grid gap-3" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              step="0.0001"
              placeholder="Latitude"
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Longitude"
              value={lng}
              onChange={(event) => setLng(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="number"
              placeholder="Total spots"
              value={totalSpots}
              onChange={(event) => setTotalSpots(Number(event.target.value))}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
            <input
              type="number"
              placeholder="Available spots"
              value={availableSpots}
              onChange={(event) => setAvailableSpots(Number(event.target.value))}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
            <input
              type="number"
              placeholder="Hourly rate"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(Number(event.target.value))}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
          </div>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          >
            <option value="covered">Covered</option>
            <option value="uncovered">Uncovered</option>
            <option value="mixed">Mixed</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900"
          >
            Add parking
          </button>
          {status && (
            <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
              {status}
            </div>
          )}
        </form>
      </Panel>
    </div>
  )
}
