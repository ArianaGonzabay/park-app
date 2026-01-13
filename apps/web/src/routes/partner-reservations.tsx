import { API_ENDPOINTS, DataState, PageHeader, Panel, apiFetch, useApiQuery } from './shared'

type PartnerReservation = {
  id: string
  parkingName: string
  status: string
  vehiclePlate: string
  startTime: string
  endTime: string
  qrCode: string
}

type PartnerReservationsResponse = {
  reservations: PartnerReservation[]
}

export function PartnerReservationsPage() {
  const { data, isLoading, error } = useApiQuery<PartnerReservationsResponse>(
    'partner-reservations',
    API_ENDPOINTS.partnerReservations
  )
  const reservations = data?.reservations ?? []
  const hasData = reservations.length > 0

  const handleCheckin = (id: string) => {
    void apiFetch(`${API_ENDPOINTS.partnerReservations}/${id}/checkin`, { method: 'POST' })
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Partner reservations"
        description="Monitor all driver bookings and entrance validation."
      />
      <Panel title="Live bookings" description={`Endpoint: ${API_ENDPOINTS.partnerReservations}`}>
        <div className="space-y-4">
          <DataState
            isLoading={isLoading}
            hasData={hasData}
            error={error}
            loadingLabel="Loading booking activity."
            emptyLabel="No active reservations yet."
          />
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200"
            >
              <div>
                <p className="text-base font-semibold text-slate-100">{reservation.parkingName}</p>
                <p className="text-xs text-slate-400">{reservation.vehiclePlate}</p>
                <p className="mt-2 text-xs text-slate-300">
                  {new Date(reservation.startTime).toLocaleString()} →{' '}
                  {new Date(reservation.endTime).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCheckin(reservation.id)}
                className="rounded-full border border-emerald-300/60 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
              >
                Check in {reservation.qrCode}
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
