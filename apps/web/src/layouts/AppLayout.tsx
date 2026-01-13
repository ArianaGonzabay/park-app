import { Link, Outlet } from '@tanstack/react-router'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_55%),radial-gradient(circle_at_15%_70%,_rgba(217,119,6,0.25),_transparent_50%),radial-gradient(circle_at_90%_20%,_rgba(148,163,184,0.15),_transparent_45%)]" />
      <div className="relative">
        <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Park App</p>
              <h1 className="font-display text-3xl text-slate-50">Nightshift parking network</h1>
              <p className="text-sm text-slate-400">
                Curated, calm parking access for drivers and operators.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Driver</p>
                <nav className="flex flex-wrap gap-2">
                  <NavLink to="/map">Map</NavLink>
                  <NavLink to="/reservations">Reservations</NavLink>
                  <NavLink to="/favorites">Favorites</NavLink>
                  <NavLink to="/profile">Profile</NavLink>
                </nav>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Partner</p>
                <nav className="flex flex-wrap gap-2">
                  <NavLink to="/partner/onboard">Onboard</NavLink>
                  <NavLink to="/partner/parking">Parking</NavLink>
                  <NavLink to="/partner/availability">Availability</NavLink>
                  <NavLink to="/partner/reservations">Bookings</NavLink>
                  <NavLink to="/partner/tariffs">Tariffs</NavLink>
                  <NavLink to="/partner/kpis">KPIs</NavLink>
                </nav>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ops</p>
                <nav className="flex flex-wrap gap-2">
                  <NavLink to="/imports">Imports</NavLink>
                  <NavLink to="/login">Login</NavLink>
                  <NavLink to="/signup">Sign up</NavLink>
                </nav>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NavLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="rounded-full border border-white/10 bg-slate-900/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-emerald-300/60 hover:text-emerald-200"
      activeProps={{
        className:
          'rounded-full border border-emerald-300/60 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100',
      }}
    >
      {children}
    </Link>
  )
}
