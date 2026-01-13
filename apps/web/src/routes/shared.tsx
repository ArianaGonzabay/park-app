import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getAccessToken } from '../lib/auth'

export type ImportJob = {
  id: string
  status: string
  bytesReceived?: number
  totalBytes?: number
  processedRows?: number
  failedRows?: number
  error?: string
  message?: string
}

type ApiState<T> = {
  data?: T
  isLoading: boolean
  error: Error | null
}

export const API_ENDPOINTS = {
  login: '/api/v1/auth/login',
  signup: '/api/v1/auth/register',
  parkingSearch: '/api/v1/parking',
  parkingDetail: (id: string) => `/api/v1/parking/${id}`,
  reservations: '/api/v1/reservations',
  reservation: (id: string) => `/api/v1/reservations/${id}`,
  reservationCancel: (id: string) => `/api/v1/reservations/${id}/cancel`,
  favorites: '/api/v1/favorites',
  profile: '/api/v1/users/me',
  vehicles: '/api/v1/users/me/vehicles',
  partnerOnboard: '/api/v1/partners/onboard',
  partnerParking: '/api/v1/partners/parking',
  partnerAvailability: (id: string) => `/api/v1/partners/parking/${id}/availability`,
  partnerReservations: '/api/v1/partners/reservations',
  partnerTariffs: (id: string) => `/api/v1/partners/tariffs/${id}`,
  partnerKpis: '/api/v1/partners/kpis',
  paymentsCheckout: '/api/v1/payments/checkout',
  paymentsByReservation: (id: string) => `/api/v1/payments/${id}`,
  notifications: '/api/v1/notifications',
  imports: '/api/v1/imports',
}

export const formatBytes = (value?: number) => {
  if (value === undefined || value === null) return '—'
  if (value === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const scaled = value / Math.pow(1024, index)
  return `${scaled.toFixed(scaled >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export const statusTone = (status?: string) => {
  if (!status) return 'bg-slate-200 text-slate-700'
  if (status === 'failed') return 'bg-rose-100 text-rose-700'
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'uploading') return 'bg-sky-100 text-sky-700'
  return 'bg-amber-100 text-amber-700'
}

export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const token = getAccessToken()
  const headers = new Headers(options?.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const response = await fetch(endpoint, {
    ...options,
    headers,
  })
  return response
}

export const useApiQuery = <T,>(queryKey: string, endpoint: string): ApiState<T> => {
  const query = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await apiFetch(endpoint)
      if (!response.ok) {
        throw new Error('Unable to reach the API endpoint.')
      }
      return (await response.json()) as T
    },
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
  }
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-[0_35px_80px_-60px_rgba(0,0,0,0.8)]">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Live preview</p>
        <h2 className="font-display text-4xl text-slate-50">{title}</h2>
        <p className="text-base text-slate-300">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </section>
  )
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
        {description && <p className="text-sm text-slate-300">{description}</p>}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function DataState({
  isLoading,
  hasData,
  error,
  loadingLabel,
  emptyLabel,
}: {
  isLoading: boolean
  hasData: boolean
  error: Error | null
  loadingLabel: string
  emptyLabel: string
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 px-5 py-6 text-sm text-slate-300">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Loading</p>
        <p className="mt-2 text-base text-slate-100">{loadingLabel}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-6 text-sm text-rose-100">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-200">Connection</p>
        <p className="mt-2 text-base">{error.message}</p>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 px-5 py-6 text-sm text-slate-300">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Empty state</p>
        <p className="mt-2 text-base text-slate-100">{emptyLabel}</p>
      </div>
    )
  }

  return null
}
