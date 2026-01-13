import Database from 'better-sqlite3'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'

const app = new Hono()
const db = new Database('./data/parkapp.db')

// Optimización: Use WAL mode y aumentar cache
db.pragma('journal_mode = WAL')
db.pragma('cache_size = -64000') // 64MB cache

app.use('*', cors({ origin: '*' }))

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Dashboard Summary - Optimizado con LIMIT para muestreo
app.get('/api/v1/analytics/summary', (c) => {
  try {
    // Usar una muestra de los datos para respuesta más rápida
    const result = db
      .prepare(
        `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_transaction_amount,
        AVG(duration_minutes) as avg_duration,
        MIN(start_time) as earliest_date,
        MAX(start_time) as latest_date
      FROM (SELECT * FROM transactions LIMIT 1000000)
    `
      )
      .get() as any

    // Calcular totales reales solo del count
    const totalCount = db.prepare('SELECT COUNT(*) as c FROM transactions').get() as any
    const estimatedRevenue = result.avg_transaction_amount * totalCount.c

    return c.json({
      totalTransactions: totalCount.c,
      totalRevenue: estimatedRevenue,
      avgTransactionAmount: result.avg_transaction_amount,
      avgDuration: result.avg_duration,
      dateRange: {
        start: result.earliest_date,
        end: result.latest_date,
      },
    })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Database error' }, 500)
  }
})

// Revenue by Payment Method - Limitado
app.get('/api/v1/analytics/revenue-by-payment-method', (c) => {
  try {
    const data = db
      .prepare(
        `
      SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_amount
      FROM (SELECT * FROM transactions WHERE payment_method IS NOT NULL AND payment_method != '' LIMIT 500000)
      GROUP BY payment_method
      ORDER BY total_revenue DESC
    `
      )
      .all()

    return c.json({ data })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Database error' }, 500)
  }
})

// Revenue by Source - Limitado
app.get('/api/v1/analytics/revenue-by-source', (c) => {
  try {
    const data = db
      .prepare(
        `
      SELECT 
        source,
        COUNT(*) as transaction_count,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_amount
      FROM (SELECT * FROM transactions LIMIT 500000)
      GROUP BY source
      ORDER BY total_revenue DESC
    `
      )
      .all()

    return c.json({ data })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Database error' }, 500)
  }
})

// Revenue by Location - Limitado
app.get('/api/v1/analytics/revenue-by-location', (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')

    const data = db
      .prepare(
        `
      SELECT 
        location_group,
        COUNT(*) as transaction_count,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_amount,
        AVG(duration_minutes) as avg_duration
      FROM (SELECT * FROM transactions WHERE location_group IS NOT NULL AND location_group != '' LIMIT 300000)
      GROUP BY location_group
      ORDER BY total_revenue DESC
      LIMIT ?
    `
      )
      .all(limit)

    return c.json({ data })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Database error' }, 500)
  }
})

// Revenue Over Time - Optimizado
app.get('/api/v1/analytics/revenue-over-time', (c) => {
  try {
    const period = c.req.query('period') || 'daily'

    let groupByFormat = '%Y-%m-%d'
    if (period === 'weekly') {
      groupByFormat = '%Y-%W'
    } else if (period === 'monthly') {
      groupByFormat = '%Y-%m'
    }

    const limit = parseInt(c.req.query('limit') || '30')

    const data = db
      .prepare(
        `
      SELECT 
        strftime(?, start_time) as period,
        COUNT(*) as transaction_count,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_amount
      FROM (SELECT * FROM transactions ORDER BY start_time DESC LIMIT 200000)
      GROUP BY period
      ORDER BY period DESC
      LIMIT ?
    `
      )
      .all(groupByFormat, limit)

    return c.json({
      period,
      data: (data as any[]).reverse(),
    })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Database error' }, 500)
  }
})

// Duration Analysis - Limitado
app.get('/api/v1/analytics/duration-analysis', (c) => {
  try {
    const ranges = db
      .prepare(
        `
      SELECT 
        CASE 
          WHEN duration_minutes < 30 THEN '0-30 min'
          WHEN duration_minutes < 60 THEN '30-60 min'
          WHEN duration_minutes < 120 THEN '1-2 hours'
          WHEN duration_minutes < 240 THEN '2-4 hours'
          WHEN duration_minutes < 480 THEN '4-8 hours'
          ELSE '8+ hours'
        END as duration_range,
        COUNT(*) as transaction_count,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_amount
      FROM (SELECT * FROM transactions LIMIT 300000)
      GROUP BY duration_range
      ORDER BY 
        CASE duration_range
          WHEN '0-30 min' THEN 1
          WHEN '30-60 min' THEN 2
          WHEN '1-2 hours' THEN 3
          WHEN '2-4 hours' THEN 4
          WHEN '4-8 hours' THEN 5
          ELSE 6
        END
    `
      )
      .all()

    return c.json({ data: ranges })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Database error' }, 500)
  }
})

// Hourly Distribution - Limitado
app.get('/api/v1/analytics/hourly-distribution', (c) => {
  try {
    const data = db
      .prepare(
        `
      SELECT 
        CAST(strftime('%H', start_time) as INTEGER) as hour,
        COUNT(*) as transaction_count,
        SUM(amount) as total_revenue,
        AVG(duration_minutes) as avg_duration
      FROM (SELECT * FROM transactions LIMIT 300000)
      GROUP BY hour
      ORDER BY hour
    `
      )
      .all()

    return c.json({ data })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Database error' }, 500)
  }
})

const port = Number(process.env.PORT || '8080')
console.log(`Dashboard API running on port ${port}`)
console.log(`Using optimized queries with sampling for performance`)

serve({ fetch: app.fetch, port })
