import { Link } from '@tanstack/react-router'

import { API_ENDPOINTS, DataState, PageHeader, Panel, apiFetch, useApiQuery } from './shared'

type Reservation = {
  id: string
  parkingId: string
  status: string
  startTime: string
  endTime: string
  vehiclePlate: string
  totalAmount: number
  qrCode: string
}

type ReservationsResponse = {
  reservations: Reservation[]
}

export function ReservationsPage() {
  const { data, isLoading, error } = useApiQuery<ReservationsResponse>(
    'reservations',
    API_ENDPOINTS.reservations
  )
  const reservations = data?.reservations ?? []
  const hasData = reservations.length > 0

  const handleCancel = (id: string) => {
    void apiFetch(API_ENDPOINTS.reservationCancel(id), { method: 'POST' })
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Upcoming reservations"
        description="Track every booking, entry code, and change window."
        actions={
          <Link
            to="/map"
            className="rounded-full border border-emerald-300/60 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
          >
            Book a new spot
          </Link>
        }
      />
      <Panel title="Reservation timeline" description={`Endpoint: ${API_ENDPOINTS.reservations}`}>
        <div className="space-y-4">
          <DataState
            isLoading={isLoading}
            hasData={hasData}
            error={error}
            loadingLabel="Loading reservations and access tokens."
            emptyLabel="No reservations scheduled yet."
          />
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200"
            >
              <div>
                <p className="text-base font-semibold text-slate-100">
                  Reservation {reservation.qrCode}
                </p>
                <p className="text-xs text-slate-400">Vehicle: {reservation.vehiclePlate}</p>
                <p className="mt-2 text-xs text-slate-300">
                  {new Date(reservation.startTime).toLocaleString()} →{' '}
                  {new Date(reservation.endTime).toLocaleString()}
                </p>
              </div>
              <div className="text-right text-xs text-slate-300">
                <p className="uppercase">{reservation.status}</p>
                <p className="text-base text-slate-100">
                  ${reservation.totalAmount.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => handleCancel(reservation.id)}
                  className="mt-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
