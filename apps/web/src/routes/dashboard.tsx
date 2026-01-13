import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1`

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

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

  const { data: paymentMethodData, isLoading: paymentLoading } = useQuery({
    queryKey: ['analytics', 'payment-method'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/revenue-by-payment-method`)
      if (!res.ok) throw new Error('Failed to fetch payment data')
      return res.json()
    },
    enabled: !!summary,
  })

  const { data: sourceData } = useQuery({
    queryKey: ['analytics', 'source'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/revenue-by-source`)
      if (!res.ok) throw new Error('Failed to fetch source data')
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

  const { data: durationData } = useQuery({
    queryKey: ['analytics', 'duration'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/duration-analysis`)
      if (!res.ok) throw new Error('Failed to fetch duration data')
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Ingresos Totales"
          value={`$${summary?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          subtitle="Todos los periodos"
          color="blue"
        />
        <SummaryCard
          title="Total Transacciones"
          value={summary?.totalTransactions?.toLocaleString() || '0'}
          subtitle="Operaciones registradas"
          color="green"
        />
        <SummaryCard
          title="Ingreso Promedio"
          value={`$${summary?.avgTransactionAmount?.toFixed(2) || '0.00'}`}
          subtitle="Por transacción"
          color="yellow"
        />
        <SummaryCard
          title="Duración Promedio"
          value={`${summary?.avgDuration?.toFixed(0) || '0'} min`}
          subtitle="Tiempo de estacionamiento"
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Payment Method */}
        <ChartCard title="Ingresos por Método de Pago">
          {paymentMethodData?.data ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData.data}
                  dataKey="total_revenue"
                  nameKey="payment_method"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {paymentMethodData.data.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : paymentLoading ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Cargando...
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Sin datos
            </div>
          )}
        </ChartCard>

        {/* Revenue by Source */}
        <ChartCard title="Ingresos por Fuente">
          {sourceData?.data ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_revenue" fill="#3b82f6" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Cargando...
            </div>
          )}
        </ChartCard>

        {/* Revenue Over Time */}
        <ChartCard title="Tendencia de Ingresos (Últimos 30 Días)" fullWidth>
          {revenueOverTime?.data ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueOverTime.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
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
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Cargando...
            </div>
          )}
        </ChartCard>

        {/* Top Locations */}
        <ChartCard title="Top 10 Ubicaciones por Ingresos">
          {locationData?.data ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData.data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location_group" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="total_revenue" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Cargando...
            </div>
          )}
        </ChartCard>

        {/* Duration Analysis */}
        <ChartCard title="Distribución de Duración de Estacionamiento">
          {durationData?.data ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={durationData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="duration_range" />
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

        {/* Hourly Distribution */}
        <ChartCard title="Distribución Horaria de Transacciones">
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
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Cargando...
            </div>
          )}
        </ChartCard>
      </div>

      {/* Data Info */}
      <div className="mt-8 bg-[#0a0f0d] border border-gray-800 rounded-lg shadow-xl p-6">
        <h3 className="font-display font-semibold text-lg mb-2 text-white">
          Información del Dataset
        </h3>
        <div className="text-sm text-gray-400 space-y-1">
          <p>
            <strong className="text-gray-300">Período:</strong> {summary?.dateRange?.start} -{' '}
            {summary?.dateRange?.end}
          </p>
          <p>
            <strong className="text-gray-300">Fuente:</strong> Parking_Transactions.csv
          </p>
          <p>
            <strong className="text-gray-300">Tamaño:</strong>{' '}
            {summary?.totalTransactions?.toLocaleString()} registros
          </p>
          <p>
            <strong className="text-gray-300">Ingresos Totales:</strong> $
            {summary?.totalRevenue?.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string
  value: string
  subtitle: string
  color: 'blue' | 'green' | 'yellow' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-700/50 text-blue-300',
    green: 'bg-green-900/20 border-green-700/50 text-green-300',
    yellow: 'bg-yellow-900/20 border-yellow-700/50 text-yellow-300',
    purple: 'bg-purple-900/20 border-purple-700/50 text-purple-300',
  }

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6 backdrop-blur-sm`}>
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <div className="text-3xl font-display font-bold mb-1">{value}</div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  )
}

function ChartCard({
  title,
  children,
  fullWidth = false,
}: {
  title: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div
      className={`bg-[#0a0f0d] border border-gray-800 rounded-lg shadow-xl p-6 ${fullWidth ? 'lg:col-span-2' : ''}`}
    >
      <h3 className="font-display font-semibold text-lg mb-4 text-white">{title}</h3>
      {children}
    </div>
  )
}
