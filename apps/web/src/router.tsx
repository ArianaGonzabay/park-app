import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './routes/dashboard'

const rootRoute = createRootRoute({
  component: AppLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
