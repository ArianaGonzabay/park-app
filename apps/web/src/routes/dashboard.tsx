import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label,
} from 'recharts'
import { FileText, Tag, DollarSign, Clock } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1`

// Traducciones para métodos de pago
const PAYMENT_METHOD_TRANSLATIONS: Record<string, string> = {
  card: 'Tarjeta',
  coins: 'Efectivo',
  cash: 'Efectivo',
  credit: 'Crédito',
  debit: 'Débito',
}

export function DashboardPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/summary`)
      if (!res.ok) throw new Error('Failed to fetch summary')
      return res.json()
    },
    retry: 2,
  })

  const { data: paymentMethodData } = useQuery({
    queryKey: ['analytics', 'payment-method'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/revenue-by-payment-method`)
      if (!res.ok) throw new Error('Failed to fetch payment method data')
      return res.json()
    },
    enabled: !!summary,
  })

  const { data: durationData } = useQuery({
    queryKey: ['analytics', 'duration'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/duration-analysis`)
      if (!res.ok) throw new Error('Failed to fetch duration data')
      return res.json()
    },
    enabled: !!summary,
  })

  const { data: revenueOverTime } = useQuery({
    queryKey: ['analytics', 'revenue-time'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/revenue-over-time?period=daily&limit=30`)
      if (!res.ok) throw new Error('Failed to fetch revenue over time')
      return res.json()
    },
    enabled: !!summary,
  })

  const { data: hourlyData } = useQuery({
    queryKey: ['analytics', 'hourly'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/hourly-distribution`)
      if (!res.ok) throw new Error('Failed to fetch hourly data')
      return res.json()
    },
    enabled: !!summary,
  })

  const { data: locationData } = useQuery({
    queryKey: ['analytics', 'location'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/revenue-by-location?limit=10`)
      if (!res.ok) throw new Error('Failed to fetch location data')
      return res.json()
    },
    enabled: !!summary,
  })

  if (summaryLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-gray-300">Cargando datos del dashboard...</div>
        </div>
      </div>
    )
  }

  if (summaryError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          <div className="text-lg">Error al cargar datos:</div>
          <div className="text-sm mt-2">{summaryError.message}</div>
          <div className="text-xs mt-2 text-gray-400">
            ¿Está el servidor API ejecutándose en el puerto 8080?
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-slate-100">
      <div className="max-w-[1600px] mx-auto px-4 py-8 space-y-6">
        {/* Row 1: Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Transacciones Totales"
            value={summary?.totalTransactions?.toLocaleString() || '0'}
            subtitle="Registros totales en el sistema"
            icon="box"
            color="blue"
          />
          <SummaryCard
            title="Ticket Promedio"
            value={`$${summary?.avgTransactionAmount?.toFixed(2) || '0.00'}`}
            subtitle="Promedio por transacción"
            icon="bag"
            color="yellow"
          />
          <SummaryCard
            title="Ventas Totales"
            value={`$${((summary?.totalRevenue || 0) / 1000)?.toFixed(1)}k` || '$0k'}
            subtitle="Ingresos totales generados"
            icon="dollar"
            color="purple"
          />
          <SummaryCard
            title="Duración Promedio"
            value={`${summary?.avgDuration?.toFixed(0) || '0'} min`}
            subtitle="Tiempo promedio de estacionamiento"
            icon="box-check"
            color="pink"
          />
        </div>

        {/* Row 2: Analysis (Revenue Trend & Payment Method) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Revenue Trend (Line Chart) */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Tendencia de Ingresos (Últimos 30 Días)"
              subtitle="Evolución diaria de ingresos y número de transacciones"
            >
              {revenueOverTime?.data ? (
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart
                    data={revenueOverTime.data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="period"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    >
                      <Label
                        value="Fecha"
                        position="insideBottom"
                        offset={-5}
                        fontSize={12}
                        fill="#64748b"
                      />
                    </XAxis>
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    >
                      <Label
                        value="Monto ($)"
                        position="insideLeft"
                        angle={-90}
                        offset={-10}
                        fontSize={12}
                        fill="#64748b"
                      />
                    </YAxis>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#0f172a' }}
                      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                      formatter={(value: any, name?: string) => {
                        if (name === 'Ingresos') return [`$${value}`, name]
                        if (name === 'Transacciones') return [value.toLocaleString(), name]
                        return [value, name]
                      }}
                      labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                      type="monotone"
                      dataKey="total_revenue"
                      stroke="#10b981"
                      name="Ingresos"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="transaction_count"
                      stroke="#f59e0b"
                      name="Transacciones"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      yAxisId="right"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <LoadingPlaceholder />
              )}
            </ChartCard>
          </div>

          {/* Right: Payment Method (Pie Chart) - RESTORED */}
          <div className="lg:col-span-1">
            <ChartCard
              title="Métodos de Pago"
              subtitle="Distribución de ingresos por método de pago"
            >
              {paymentMethodData?.data ? (
                <ResponsiveContainer width="100%" height={380}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData.data.map(
                        (item: { payment_method: string; total_revenue: number }) => ({
                          ...item,
                          payment_method:
                            PAYMENT_METHOD_TRANSLATIONS[item.payment_method.toLowerCase()] ||
                            item.payment_method,
                        })
                      )}
                      dataKey="total_revenue"
                      nameKey="payment_method"
                      cx="50%"
                      cy="40%"
                      outerRadius={70}
                      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                      label={(entry: any) => {
                        const total = paymentMethodData.data.reduce(
                          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                          (acc: number, curr: any) => acc + curr.total_revenue,
                          0
                        )
                        const percent = ((entry.payload.total_revenue / total) * 100).toFixed(0)
                        return `${percent}%`
                      }}
                      labelLine={false}
                    >
                      {paymentMethodData.data.map((_: unknown, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#0f172a' }}
                      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                      formatter={(value: any, name?: string) => [`$${value}`, name || 'Ingresos']}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[380px] flex items-center justify-center text-gray-400">
                  Cargando...
                </div>
              )}
            </ChartCard>
          </div>
        </div>

        {/* Row 3: Top Locations, Hourly Distribution & Duration - 3 Equal Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Locations (Vertical Bar Chart) */}
          <div>
            <ChartCard title="Top 10 Ubicaciones" subtitle="Ubicaciones con mayores ingresos">
              {locationData?.data ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={locationData.data}
                    margin={{ top: 10, right: 10, left: 5, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="location_group"
                      stroke="#64748b"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={70}
                    />
                    <YAxis
                      tickFormatter={(value) => `$${value / 1000}k`}
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                    >
                      <Label
                        value="Ingresos ($)"
                        position="insideLeft"
                        angle={-90}
                        offset={5}
                        fontSize={11}
                        fill="#64748b"
                        style={{ textAnchor: 'middle' }}
                      />
                    </YAxis>
                    <Tooltip
                      cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#0f172a' }}
                      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Ingresos']}
                    />
                    <Bar
                      dataKey="total_revenue"
                      fill="#8b5cf6"
                      name="Ingresos"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <LoadingPlaceholder />
              )}
            </ChartCard>
          </div>

          {/* Hourly Distribution (Line Chart) */}
          <div>
            <ChartCard title="Distribución Horaria" subtitle="Transacciones por hora del día">
              {hourlyData?.data ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={hourlyData.data}
                    margin={{ top: 10, right: 15, left: 5, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="hour"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}h`}
                    >
                      <Label
                        value="Hora del día"
                        position="insideBottom"
                        offset={-15}
                        fontSize={11}
                        fill="#64748b"
                      />
                    </XAxis>
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={55}
                    >
                      <Label
                        value="Transacciones"
                        position="insideLeft"
                        angle={-90}
                        offset={10}
                        fontSize={11}
                        fill="#64748b"
                        style={{ textAnchor: 'middle' }}
                      />
                    </YAxis>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#0f172a' }}
                      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                      formatter={(value: any) => [value.toLocaleString(), 'Transacciones']}
                      labelFormatter={(label) => `${label}:00 horas`}
                    />
                    <Line
                      type="monotone"
                      dataKey="transaction_count"
                      stroke="#3b82f6"
                      name="Transacciones"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <LoadingPlaceholder />
              )}
            </ChartCard>
          </div>

          {/* Duration Analysis (Bar Chart) */}
          <div>
            <ChartCard title="Duración Estacionamiento" subtitle="Transacciones por duración">
              {durationData?.data ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={durationData.data}
                    margin={{ top: 10, right: 10, left: 5, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="duration_range"
                      stroke="#64748b"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={70}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={55}
                    >
                      <Label
                        value="Transacciones"
                        position="insideLeft"
                        angle={-90}
                        offset={10}
                        fontSize={11}
                        fill="#64748b"
                        style={{ textAnchor: 'middle' }}
                      />
                    </YAxis>
                    <Tooltip
                      cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#0f172a' }}
                      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                      formatter={(value: any) => [value.toLocaleString(), 'Transacciones']}
                    />
                    <Bar
                      dataKey="transaction_count"
                      fill="#ec4899"
                      name="Transacciones"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-400">
                  Cargando...
                </div>
              )}
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingPlaceholder() {
  return (
    <div className="h-[320px] flex flex-col items-center justify-center text-slate-400">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
      <span className="text-sm">Cargando datos...</span>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: string
  subtitle: string
  icon: 'box' | 'bag' | 'dollar' | 'box-check'
  color: 'blue' | 'yellow' | 'purple' | 'pink'
}) {
  const iconMap = {
    box: <FileText className="w-6 h-6" />,
    bag: <Tag className="w-6 h-6" />,
    dollar: <DollarSign className="w-6 h-6" />,
    'box-check': <Clock className="w-6 h-6" />,
  }

  const gradientColors = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-amber-400 to-amber-500',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  }

  const lightBgColors = {
    blue: 'bg-blue-50',
    yellow: 'bg-amber-50',
    purple: 'bg-purple-50',
    pink: 'bg-pink-50',
  }

  return (
    <div
      className={`${lightBgColors[color]} rounded-xl p-6 relative overflow-hidden flex justify-between items-start min-h-[140px] shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200`}
    >
      <div className="relative z-10">
        <div className="text-3xl font-bold text-slate-800 mb-2">{value}</div>
        <div className="text-slate-600 font-medium mb-1">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <div
        className={`bg-gradient-to-br ${gradientColors[color]} p-3 rounded-xl text-white shadow-lg`}
      >
        {iconMap[icon]}
      </div>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl p-6 h-full shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  )
}
