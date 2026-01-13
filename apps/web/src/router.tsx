import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { AppLayout } from './layouts/AppLayout'
import { FavoritesPage } from './routes/favorites'
import { ImportsPage } from './routes/imports'
import { LoginPage } from './routes/login'
import { MapPage } from './routes/map'
import { ParkingDetailPage } from './routes/parking-detail'
import { PartnerAvailabilityPage } from './routes/partner-availability'
import { PartnerKpisPage } from './routes/partner-kpis'
import { PartnerOnboardPage } from './routes/partner-onboard'
import { PartnerParkingPage } from './routes/partner-parking'
import { PartnerReservationsPage } from './routes/partner-reservations'
import { PartnerTariffsPage } from './routes/partner-tariffs'
import { ProfilePage } from './routes/profile'
import { ReservePage } from './routes/reserve'
import { ReservationsPage } from './routes/reservations'
import { SignupPage } from './routes/signup'

const rootRoute = createRootRoute({
  component: AppLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MapPage,
})

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/map',
  component: MapPage,
})

const parkingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/parking/$id',
  component: ParkingDetailPage,
})

const reserveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reserve/$id',
  component: ReservePage,
})

const reservationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reservations',
  component: ReservationsPage,
})

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  component: FavoritesPage,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
})

const partnerOnboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner/onboard',
  component: PartnerOnboardPage,
})

const partnerParkingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner/parking',
  component: PartnerParkingPage,
})

const partnerAvailabilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner/availability',
  component: PartnerAvailabilityPage,
})

const partnerReservationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner/reservations',
  component: PartnerReservationsPage,
})

const partnerTariffsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner/tariffs',
  component: PartnerTariffsPage,
})

const partnerKpisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner/kpis',
  component: PartnerKpisPage,
})

const importsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/imports',
  component: ImportsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  mapRoute,
  parkingRoute,
  reserveRoute,
  reservationsRoute,
  favoritesRoute,
  profileRoute,
  partnerOnboardRoute,
  partnerParkingRoute,
  partnerAvailabilityRoute,
  partnerReservationsRoute,
  partnerTariffsRoute,
  partnerKpisRoute,
  importsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
