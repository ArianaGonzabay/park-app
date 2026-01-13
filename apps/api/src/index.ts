import './db/client.js'

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { serve } from '@hono/node-server'

import analyticsRoutes from './routes/analytics.js'

const app = new Hono()

// CORS for local development
app.use('*', cors({ origin: '*', credentials: false }))
app.use('*', logger())
app.use('*', prettyJSON())

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Dashboard API is running',
  })
)

// Only analytics routes needed for dashboard
app.route('/api/v1/analytics', analyticsRoutes)

app.notFound((c) => c.json({ error: 'Not Found' }, 404))

const port = Number(process.env.PORT || '8080')

console.log(`Dashboard API starting on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})

export default app
