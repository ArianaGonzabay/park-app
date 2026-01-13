import { useState } from 'react'

import { API_ENDPOINTS, DataState, PageHeader, Panel, apiFetch, useApiQuery } from './shared'

type Profile = {
  id: string
  name: string
  email: string
  phoneNumber?: string
  role: string
}

type ProfileResponse = Profile

type Vehicle = {
  id: string
  plate: string
  make?: string
  model?: string
  color?: string
}

type VehiclesResponse = {
  vehicles: Vehicle[]
}

type NotificationsResponse = {
  notifications: Array<{ id: string; type: string; message: string; isRead: boolean }>
}

export function ProfilePage() {
  const {
    data: profile,
    isLoading,
    error,
  } = useApiQuery<ProfileResponse>('profile', API_ENDPOINTS.profile)
  const {
    data: vehiclesData,
    isLoading: vehiclesLoading,
    error: vehiclesError,
  } = useApiQuery<VehiclesResponse>('vehicles', API_ENDPOINTS.vehicles)
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useApiQuery<NotificationsResponse>('notifications', API_ENDPOINTS.notifications)

  const vehicles = vehiclesData?.vehicles ?? []
  const notifications = notificationsData?.notifications ?? []

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleColor, setVehicleColor] = useState('')
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  const handleProfileUpdate = () => {
    void (async () => {
      setActionStatus(null)
      const response = await apiFetch(API_ENDPOINTS.profile, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || profile?.name,
          phoneNumber: phoneNumber || profile?.phoneNumber,
        }),
      })
      setActionStatus(response.ok ? 'Profile updated' : 'Profile update failed')
    })()
  }

  const handleAddVehicle = () => {
    void (async () => {
      setActionStatus(null)
      const response = await apiFetch(API_ENDPOINTS.vehicles, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate: vehiclePlate,
          make: vehicleMake || undefined,
          model: vehicleModel || undefined,
          color: vehicleColor || undefined,
        }),
      })
      setActionStatus(response.ok ? 'Vehicle added' : 'Vehicle add failed')
    })()
  }

  const hasProfile = Boolean(profile)
  const hasVehicles = vehicles.length > 0
  const hasNotifications = notifications.length > 0

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <PageHeader
        title="Driver profile"
        description="Manage vehicles, payout preferences, and parking receipts."
      />
      <Panel title="Account overview" description={`Endpoint: ${API_ENDPOINTS.profile}`}>
        <div className="space-y-4">
          <DataState
            isLoading={isLoading}
            hasData={hasProfile}
            error={error}
            loadingLabel="Loading driver profile data."
            emptyLabel="Profile data will appear after onboarding."
          />
          {profile && (
            <div className="space-y-3 text-sm text-slate-300">
              <p className="text-base text-slate-100">{profile.email}</p>
              <label className="grid gap-2">
                Name
                <input
                  type="text"
                  defaultValue={profile.name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
                />
              </label>
              <label className="grid gap-2">
                Phone
                <input
                  type="tel"
                  defaultValue={profile.phoneNumber ?? ''}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-emerald-300/70 focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={handleProfileUpdate}
                className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900"
              >
                Save profile
              </button>
            </div>
          )}
          {actionStatus && (
            <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
              {actionStatus}
            </div>
          )}
        </div>
      </Panel>
      <Panel title="Vehicles" description={`Endpoint: ${API_ENDPOINTS.vehicles}`}>
        <div className="space-y-4">
          <DataState
            isLoading={vehiclesLoading}
            hasData={hasVehicles}
            error={vehiclesError}
            loadingLabel="Loading saved vehicles."
            emptyLabel="No vehicles on file yet. Add one to reserve faster."
          />
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200"
            >
              <p className="text-base font-semibold text-slate-100">{vehicle.plate}</p>
              <p className="text-xs text-slate-400">
                {[vehicle.make, vehicle.model, vehicle.color].filter(Boolean).join(' · ') || '—'}
              </p>
            </div>
          ))}
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Plate"
              value={vehiclePlate}
              onChange={(event) => setVehiclePlate(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Make"
              value={vehicleMake}
              onChange={(event) => setVehicleMake(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Model"
              value={vehicleModel}
              onChange={(event) => setVehicleModel(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Color"
              value={vehicleColor}
              onChange={(event) => setVehicleColor(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300/70 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddVehicle}
              className="rounded-xl border border-emerald-300/60 bg-emerald-300/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100"
            >
              Add vehicle
            </button>
          </div>
        </div>
      </Panel>
      <Panel title="Notifications" description={`Endpoint: ${API_ENDPOINTS.notifications}`}>
        <div className="space-y-4">
          <DataState
            isLoading={notificationsLoading}
            hasData={hasNotifications}
            error={notificationsError}
            loadingLabel="Loading notification history."
            emptyLabel="No notifications yet."
          />
          {notifications.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{note.type}</p>
              <p className="mt-2 text-base text-slate-100">{note.message}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
