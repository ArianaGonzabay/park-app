import { useMemo, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'

import { API_ENDPOINTS, PageHeader, Panel, apiFetch, useApiQuery } from './shared'

type Vehicle = {
  id: string
  plate: string
}

type VehiclesResponse = {
  vehicles: Vehicle[]
}

type ReservationResponse = {
  reservation: {
    id: string
    qrCode: string
    totalAmount: number
  }
}

export function ReservePage() {
  const { id } = useParams({ from: '/reserve/$id' })
  const { data } = useApiQuery<VehiclesResponse>('vehicles', API_ENDPOINTS.vehicles)
  const vehicles = data?.vehicles ?? []

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [reservation, setReservation] = useState<ReservationResponse['reservation'] | null>(null)

  const dateTimeIso = useMemo(() => {
    if (!date || !time) return ''
    return new Date(`${date}T${time}`).toISOString()
  }, [date, time])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void (async () => {
      try {
        setStatus('loading')
        setError(null)
        const response = await apiFetch(API_ENDPOINTS.reservations, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parkingId: id,
            startTime: dateTimeIso,
            durationMinutes: duration,
            vehiclePlate,
          }),
        })
        if (!response.ok) {
          throw new Error('Reservation failed. Check availability and try again.')
        }
        const data = (await response.json()) as ReservationResponse
        setReservation(data.reservation)

        await apiFetch(API_ENDPOINTS.paymentsCheckout, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservationId: data.reservation.id }),
        })

        setStatus('success')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to reserve parking')
        setStatus('error')
      }
    })()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <PageHeader
        title="Reserve your space"
        description="Lock in your arrival window, confirm vehicle, and pay securely."
        actions={
          <Link
            to="/parking/$id"
            params={{ id }}
            className="rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
          >
            Back to detail
          </Link>
        }
      />
      <Panel title="Reservation setup" description={`For parking ID ${id}.`}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-slate-300">
            Arrival date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Arrival time
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Duration (minutes)
            <input
              type="number"
              min={15}
              max={1440}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Vehicle
            <select
              value={vehiclePlate}
              onChange={(event) => setVehiclePlate(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            >
              <option value="">Select a saved vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.plate}>
                  {vehicle.plate}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            disabled={!dateTimeIso || !vehiclePlate || status === 'loading'}
          >
            {status === 'loading' ? 'Reserving…' : 'Confirm reservation'}
          </button>
          {reservation && status === 'success' && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Reservation confirmed. QR code: {reservation.qrCode}. Total: ${reservation.totalAmount.toFixed(2)}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
          <p className="text-xs text-slate-400">Payments are processed via the mock checkout API.</p>
        </form>
      </Panel>
    </div>
  )
}
