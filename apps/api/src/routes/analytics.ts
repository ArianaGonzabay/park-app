import { Hono } from 'hono'
import { db } from '../db/client.js'

const analytics = new Hono()

// Dashboard Summary - Indicadores principales
analytics.get('/summary', (c) => {
  const summary = db
    .prepare(
      `
    SELECT 
      COUNT(*) as total_transactions,
      SUM(amount) as total_revenue,
      AVG(amount) as avg_transaction_amount,
      AVG(duration_minutes) as avg_duration,
      MIN(start_time) as earliest_date,
      MAX(start_time) as latest_date
    FROM transactions
  `
    )
    .get() as {
    total_transactions: number
    total_revenue: number
    avg_transaction_amount: number
    avg_duration: number
    earliest_date: string
    latest_date: string
  }

  return c.json({
    totalTransactions: summary.total_transactions,
    totalRevenue: summary.total_revenue,
    avgTransactionAmount: summary.avg_transaction_amount,
    avgDuration: summary.avg_duration,
    dateRange: {
      start: summary.earliest_date,
      end: summary.latest_date,
    },
  })
})

// Revenue by Payment Method
analytics.get('/revenue-by-payment-method', (c) => {
  const data = db
    .prepare(
      `
    SELECT 
      payment_method,
      COUNT(*) as transaction_count,
      SUM(amount) as total_revenue,
      AVG(amount) as avg_amount
    FROM transactions
    WHERE payment_method IS NOT NULL AND payment_method != ''
    GROUP BY payment_method
    ORDER BY total_revenue DESC
  `
    )
    .all() as Array<{
    payment_method: string
    transaction_count: number
    total_revenue: number
    avg_amount: number
  }>

  return c.json({ data })
})

// Revenue by Location
analytics.get('/revenue-by-location', (c) => {
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
    FROM transactions
    WHERE location_group IS NOT NULL AND location_group != ''
    GROUP BY location_group
    ORDER BY total_revenue DESC
    LIMIT ?
  `
    )
    .all(limit) as Array<{
    location_group: string
    transaction_count: number
    total_revenue: number
    avg_amount: number
    avg_duration: number
  }>

  return c.json({ data })
})

// Revenue by Source (Parking Meters vs App)
analytics.get('/revenue-by-source', (c) => {
  const data = db
    .prepare(
      `
    SELECT 
      source,
      COUNT(*) as transaction_count,
      SUM(amount) as total_revenue,
      AVG(amount) as avg_amount
    FROM transactions
    GROUP BY source
    ORDER BY total_revenue DESC
  `
    )
    .all() as Array<{
    source: string
    transaction_count: number
    total_revenue: number
    avg_amount: number
  }>

  return c.json({ data })
})

// Revenue over time (daily)
analytics.get('/revenue-over-time', (c) => {
  const period = c.req.query('period') || 'daily' // daily, weekly, monthly

  let groupByFormat = '%Y-%m-%d' // daily
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
    FROM transactions
    GROUP BY period
    ORDER BY period DESC
    LIMIT ?
  `
    )
    .all(groupByFormat, limit) as Array<{
    period: string
    transaction_count: number
    total_revenue: number
    avg_amount: number
  }>

  return c.json({
    period,
    data: data.reverse(), // Reverse to show chronological order
  })
})

// Duration Analysis
analytics.get('/duration-analysis', (c) => {
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
    FROM transactions
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
    .all() as Array<{
    duration_range: string
    transaction_count: number
    total_revenue: number
    avg_amount: number
  }>

  return c.json({ data: ranges })
})

// Hourly Distribution (peak hours)
analytics.get('/hourly-distribution', (c) => {
  const data = db
    .prepare(
      `
    SELECT 
      CAST(strftime('%H', start_time) as INTEGER) as hour,
      COUNT(*) as transaction_count,
      SUM(amount) as total_revenue,
      AVG(duration_minutes) as avg_duration
    FROM transactions
    GROUP BY hour
    ORDER BY hour
  `
    )
    .all() as Array<{
    hour: number
    transaction_count: number
    total_revenue: number
    avg_duration: number
  }>

  return c.json({ data })
})

// Top Kiosks
analytics.get('/top-kiosks', (c) => {
  const limit = parseInt(c.req.query('limit') || '20')

  const data = db
    .prepare(
      `
    SELECT 
      kiosk_id,
      COUNT(*) as transaction_count,
      SUM(amount) as total_revenue,
      AVG(amount) as avg_amount
    FROM transactions
    WHERE kiosk_id IS NOT NULL AND kiosk_id != ''
    GROUP BY kiosk_id
    ORDER BY total_revenue DESC
    LIMIT ?
  `
    )
    .all(limit) as Array<{
    kiosk_id: string
    transaction_count: number
    total_revenue: number
    avg_amount: number
  }>

  return c.json({ data })
})

export default analytics
