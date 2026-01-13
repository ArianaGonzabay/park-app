import 'dotenv/config'

import './db/client.js'

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { serve } from '@hono/node-server'

import { getEnv } from './config/env.js'
import { onError } from './middleware/error.js'
import type { Variables } from './types/env.js'
import authRoutes from './routes/auth.js'
import favoritesRoutes from './routes/favorites.js'
import notificationsRoutes from './routes/notifications.js'
import parkingRoutes from './routes/parking.js'
import partnersRoutes from './routes/partners.js'
import paymentsRoutes from './routes/payments.js'
import reservationRoutes from './routes/reservations.js'
import usersRoutes from './routes/users.js'
import analyticsRoutes from './routes/analytics.js'
import { importsRoutes } from './routes/imports.js'

const env = getEnv()

const app = new Hono<{ Variables: Variables }>()

const corsOrigin = env.CORS_ORIGIN
const corsConfig =
  corsOrigin === '*'
    ? { origin: '*', credentials: false }
    : { origin: corsOrigin.split(',').map((o) => o.trim()), credentials: true }

app.use('*', cors(corsConfig))
app.use('*', logger())
app.use('*', prettyJSON())

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/users', usersRoutes)
app.route('/api/v1/favorites', favoritesRoutes)
app.route('/api/v1/notifications', notificationsRoutes)
app.route('/api/v1/parking', parkingRoutes)
app.route('/api/v1/reservations', reservationRoutes)
app.route('/api/v1/payments', paymentsRoutes)
app.route('/api/v1/partners', partnersRoutes)
app.route('/api/v1/analytics', analyticsRoutes)
app.route('/api/v1/imports', importsRoutes)

app.onError(onError)
app.notFound((c) => c.json({ error: 'Not Found' }, 404))

const port = Number(env.PORT ?? '') || 8080

console.log(`Server starting on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})

export default app
