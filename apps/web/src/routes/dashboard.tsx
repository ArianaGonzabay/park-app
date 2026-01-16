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
} from 'recharts'
import { FileText, Tag, DollarSign, Clock } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1`

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
          <ChartCard title="Tendencia de Ingresos (Últimos 30 Días)">
            {revenueOverTime?.data ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueOverTime.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="period"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      color: '#0f172a',
                    }}
                    itemStyle={{ color: '#0f172a' }}
                    formatter={(value: any) => [`$${value}`, 'Ingresos']}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total_revenue"
                    stroke="#10b981"
                    name="Ingresos"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="transaction_count"
                    stroke="#f59e0b"
                    name="Transacciones"
                    strokeWidth={2}
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
          <ChartCard title="Métodos de Pago">
            {paymentMethodData?.data ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData.data}
                    dataKey="total_revenue"
                    nameKey="payment_method"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
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
                    }}
                    itemStyle={{ color: '#0f172a' }}
                    formatter={(value: any) => [`$${value}`, 'Ingresos']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
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
          <ChartCard title="Top 10 Ubicaciones por Ingresos">
            {locationData?.data ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={locationData.data}
                  margin={{ top: 5, right: 10, left: 10, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="location_group"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value / 1000}k`}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      color: '#0f172a',
                    }}
                    itemStyle={{ color: '#0f172a' }}
                    formatter={(value: any) => [`$${value}`, 'Ingresos']}
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
          <ChartCard title="Distribución Horaria">
            {hourlyData?.data ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="transaction_count"
                    stroke="#3b82f6"
                    name="Transacciones"
                    strokeWidth={2}
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
          <ChartCard title="Duración Estacionamiento">
            {durationData?.data ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={durationData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="duration_range" hide /> {/* Hide text if too long */}
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transaction_count" fill="#ec4899" name="Transacciones" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Cargando...
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  )
}

function LoadingPlaceholder() {
  return <div className="h-[200px] flex items-center justify-center text-gray-500">Loading...</div>
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

  const bgColors = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  }

  return (
    <div className="bg-white rounded-xl p-6 relative overflow-hidden flex justify-between items-start min-h-[140px] shadow-sm border border-slate-200">
      <div className="relative z-10">
        <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
        <div className="text-slate-500 font-medium mb-1">{title}</div>
        <div className="text-xs text-slate-400">{subtitle}</div>
      </div>
      <div className={`${bgColors[color]} p-3 rounded-full text-white shadow-lg`}>
        {iconMap[icon]}
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-6 h-full shadow-sm border border-slate-200">
      <h3 className="font-semibold text-lg mb-6 text-slate-800">{title}</h3>
      {children}
    </div>
  )
}
