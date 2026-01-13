import { API_ENDPOINTS, DataState, PageHeader, Panel, useApiQuery } from './shared'

type PartnerKpisResponse = {
  kpis: {
    totalReservations: number
    totalRevenue: number
    totalSpots: number
    availableSpots: number
  }
}

export function PartnerKpisPage() {
  const { data, isLoading, error } = useApiQuery<PartnerKpisResponse>(
    'partner-kpis',
    API_ENDPOINTS.partnerKpis
  )
  const kpis = data?.kpis
  const hasData = Boolean(kpis)

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <PageHeader
        title="Performance KPIs"
        description="Track revenue, utilization, and SLA adherence across your fleet."
      />
      <Panel title="KPI overview" description={`Endpoint: ${API_ENDPOINTS.partnerKpis}`}>
        <DataState
          isLoading={isLoading}
          hasData={hasData}
          error={error}
          loadingLabel="Loading KPI dashboard."
          emptyLabel="Connect data warehouse to see KPIs."
        />
      </Panel>
      <Panel title="Highlights" description="Snapshot tiles will render here.">
        <div className="grid gap-4">
          {kpis && (
            <>
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reservations</p>
                <p className="mt-2 font-display text-2xl text-slate-50">{kpis.totalReservations}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Revenue</p>
                <p className="mt-2 font-display text-2xl text-slate-50">
                  ${kpis.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Availability</p>
                <p className="mt-2 font-display text-2xl text-slate-50">
                  {kpis.availableSpots}/{kpis.totalSpots}
                </p>
              </div>
            </>
          )}
        </div>
      </Panel>
    </div>
  )
}
