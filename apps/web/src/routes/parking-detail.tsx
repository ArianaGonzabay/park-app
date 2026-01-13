import { Link, useParams } from '@tanstack/react-router'

import { API_ENDPOINTS, DataState, PageHeader, Panel, useApiQuery } from './shared'

type ParkingDetail = {
  id: string
  name: string
  address: string
  availableSpots: number
  hourlyRate: number
  amenities: string[]
  operatingHours: { opensAt: string; closesAt: string; days: string[] }
}

type ParkingDetailResponse = {
  parking: ParkingDetail
}

export function ParkingDetailPage() {
  const { id } = useParams({ from: '/parking/$id' })
  const endpoint = API_ENDPOINTS.parkingDetail(id)
  const { data, isLoading, error } = useApiQuery<ParkingDetailResponse>(`parking-${id}`, endpoint)
  const parking = data?.parking

  return (
    <div className="grid gap-8">
      <PageHeader
        title={parking ? parking.name : 'Parking detail'}
        description="See access notes, amenities, and live pricing for this garage."
        actions={
          <Link
            to="/reserve/$id"
            params={{ id }}
            className="rounded-full bg-emerald-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
          >
            Reserve spot
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Location overview" description={`Endpoint: ${endpoint}`}>
          <div className="space-y-4 text-sm text-slate-300">
            <DataState
              isLoading={isLoading}
              hasData={Boolean(parking)}
              error={error}
              loadingLabel="Loading parking metadata and live inventory."
              emptyLabel="No detail yet. Connect inventory service."
            />
            {parking && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Address</p>
                  <p className="mt-2 text-base text-slate-100">{parking.address}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Availability</p>
                  <p className="mt-2 text-base text-slate-100">
                    {parking.availableSpots} spots open
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Amenities</p>
                  <p className="mt-2 text-base text-slate-100">
                    {parking.amenities.join(', ') || '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Hours</p>
                  <p className="mt-2 text-base text-slate-100">
                    {parking.operatingHours.opensAt} - {parking.operatingHours.closesAt}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Panel>
        <Panel title="Pricing breakdown" description="Dynamic tariffs flow here.">
          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Estimated total</p>
              <p className="mt-2 font-display text-3xl text-slate-50">
                {parking ? `$${parking.hourlyRate.toFixed(2)} / hr` : '$ —'}
              </p>
              <p className="text-xs text-slate-500">Calculated from current hourly rate.</p>
            </div>
            <Link
              to="/reserve/$id"
              params={{ id }}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900"
            >
              Continue to reserve
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  )
}
