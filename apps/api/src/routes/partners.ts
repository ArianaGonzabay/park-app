import crypto from 'node:crypto'

import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { zValidator } from '@hono/zod-validator'

import type { Variables } from '../types/env.js'
import {
  CreateParkingLocationSchema,
  PartnerOnboardSchema,
  TariffSchema,
  UpdateParkingAvailabilitySchema,
  UpdateParkingLocationSchema,
} from '@park-app/shared/schemas'
import { authMiddleware } from '../middleware/auth.js'
import { db, jsonParse } from '../db/client.js'

const partners = new Hono<{ Variables: Variables }>()

const getUserId = (c: { get: (key: 'userId') => string | undefined }): string => {
  const userId: string | undefined = c.get('userId')
  if (!userId) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  return userId
}

const requirePartner = (userId: string) => {
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(userId) as
    | { role: string }
    | undefined
  if (!user || user.role !== 'partner') {
    return false
  }
  return true
}

partners.use('*', authMiddleware)

partners.post('/onboard', zValidator('json', PartnerOnboardSchema), (c) => {
  const userId = getUserId(c)
  const data = c.req.valid('json')

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run('partner', userId)
  db.prepare(
    'INSERT OR REPLACE INTO partner_profiles (user_id, company_name, contact_name, verified) VALUES (?, ?, ?, ?)'
  ).run(userId, data.companyName, data.contactName, 0)

  return c.json({ ok: true })
})

partners.get('/parking', (c) => {
  const userId = getUserId(c)
  if (!requirePartner(userId)) return c.json({ error: 'Partner access required' }, 403)

  const rows = db
    .prepare('SELECT * FROM parking_locations WHERE partner_id = ? ORDER BY name ASC')
    .all(userId) as Array<{
    id: string
    name: string
    address: string
    lat: number
    lng: number
    total_spots: number
    available_spots: number
    hourly_rate: number
    type: string
    amenities: string
    images: string
    operating_hours: string
    rating: number
    review_count: number
    created_at: string
  }>

  return c.json({
    parking: rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      location: { lat: row.lat, lng: row.lng },
      totalSpots: row.total_spots,
      availableSpots: row.available_spots,
      hourlyRate: row.hourly_rate,
      type: row.type,
      amenities: jsonParse<string[]>(row.amenities, []),
      images: jsonParse<string[]>(row.images, []),
      operatingHours: jsonParse(row.operating_hours, {
        opensAt: '07:00',
        closesAt: '22:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      }),
      rating: row.rating,
      reviewCount: row.review_count,
      createdAt: row.created_at,
    })),
  })
})

partners.post('/parking', zValidator('json', CreateParkingLocationSchema), (c) => {
  const userId = getUserId(c)
  if (!requirePartner(userId)) return c.json({ error: 'Partner access required' }, 403)

  const data = c.req.valid('json')
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO parking_locations (
      id, partner_id, name, address, lat, lng, total_spots, available_spots, hourly_rate, type,
      amenities, images, operating_hours, rating, review_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    data.name,
    data.address,
    data.location.lat,
    data.location.lng,
    data.totalSpots,
    data.availableSpots,
    data.hourlyRate,
    data.type,
    JSON.stringify(data.amenities ?? []),
    JSON.stringify(data.images ?? []),
    JSON.stringify(data.operatingHours),
    0,
    0,
    createdAt
  )

  return c.json({ id }, 201)
})

partners.patch('/parking/:id', zValidator('json', UpdateParkingLocationSchema), (c) => {
  const userId = getUserId(c)
  if (!requirePartner(userId)) return c.json({ error: 'Partner access required' }, 403)

  const parkingId = c.req.param('id')
  const data = c.req.valid('json')

  const existing = db
    .prepare('SELECT id FROM parking_locations WHERE id = ? AND partner_id = ?')
    .get(parkingId, userId) as { id: string } | undefined

  if (!existing) {
    return c.json({ error: 'Parking location not found' }, 404)
  }

  const updates: string[] = []
  const values: unknown[] = []

  const fields: Array<[string, unknown]> = [
    ['name', data.name],
    ['address', data.address],
    ['lat', data.location?.lat],
    ['lng', data.location?.lng],
    ['total_spots', data.totalSpots],
    ['available_spots', data.availableSpots],
    ['hourly_rate', data.hourlyRate],
    ['type', data.type],
    ['amenities', data.amenities ? JSON.stringify(data.amenities) : undefined],
    ['images', data.images ? JSON.stringify(data.images) : undefined],
    ['operating_hours', data.operatingHours ? JSON.stringify(data.operatingHours) : undefined],
  ]

  for (const [key, value] of fields) {
    if (value !== undefined) {
      updates.push(`${key} = ?`)
      values.push(value)
    }
  }

  if (updates.length === 0) {
    return c.json({ ok: true })
  }

  db.prepare(`UPDATE parking_locations SET ${updates.join(', ')} WHERE id = ?`).run(
    ...values,
    parkingId
  )

  return c.json({ ok: true })
})

partners.patch('/parking/:id/availability', zValidator('json', UpdateParkingAvailabilitySchema), (c) => {
  const userId = getUserId(c)
  if (!requirePartner(userId)) return c.json({ error: 'Partner access required' }, 403)

  const parkingId = c.req.param('id')
  const data = c.req.valid('json')

  const updated = db
    .prepare('UPDATE parking_locations SET available_spots = ? WHERE id = ? AND partner_id = ?')
    .run(data.availableSpots, parkingId, userId)

  if (updated.changes === 0) {
    return c.json({ error: 'Parking location not found' }, 404)
  }

  return c.json({ ok: true })
})

partners.get('/reservations', (c) => {
  const userId = getUserId(c)
  if (!requirePartner(userId)) return c.json({ error: 'Partner access required' }, 403)

  const rows = db
    .prepare(
      `SELECT reservations.*, parking_locations.name as parking_name
       FROM reservations
       JOIN parking_locations ON parking_locations.id = reservations.parking_id
       WHERE parking_locations.partner_id = ?
       ORDER BY datetime(reservations.created_at) DESC`
    )
    .all(userId) as Array<{
    id: string
    user_id: string
    parking_id: string
    parking_name: string
    status: string
    start_time: string
    end_time: string
    vehicle_plate: string
    total_amount: number
    qr_code: string
    created_at: string
  }>

  return c.json({
    reservations: rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      parkingId: row.parking_id,
      parkingName: row.parking_name,
      status: row.status,
      startTime: row.start_time,
      endTime: row.end_time,
      vehiclePlate: row.vehicle_plate,
      totalAmount: row.total_amount,
      qrCode: row.qr_code,
      createdAt: row.created_at,
    })),
  })
})

partners.post('/reservations/:id/checkin', (c) => {
  const userId = getUserId(c)
  if (!requirePartner(userId)) return c.json({ error: 'Partner access required' }, 403)

  const id = c.req.param('id')
  const updated = db
    .prepare(
      `UPDATE reservations
       SET status = 'checked_in'
       WHERE id = ?
         AND parking_id IN (SELECT id FROM parking_locations WHERE partner_id = ?)`
    )
    .run(id, userId)

  if (updated.changes === 0) {
    return c.json({ error: 'Reservation not found' }, 404)
  }

  return c.json({ ok: true })
})

partners.get('/tariffs/:parkingId', (c) => {
  const userId = getUserId(c)
  if (!requirePartner(userId)) return c.json({ error: 'Partner access required' }, 403)

  const parkingId = c.req.param('parkingId')
  const row = db
    .prepare(
      `SELECT tariffs.* FROM tariffs
       JOIN parking_locations ON parking_locations.id = tariffs.parking_id
       WHERE tariffs.parking_id = ? AND parking_locations.partner_id = ?`
    )
    .get(parkingId, userId) as
    | {
        parking_id: string
        base_rate: number
        peak_rate: number | null
        peak_start: string | null
        peak_end: string | null
      }
    | undefined

  if (!row) {
    return c.json({ error: 'Tariff not found' }, 404)
  }

  return c.json({
    tariff: {
      parkingId: row.parking_id,
      baseRate: row.base_rate,
      peakRate: row.peak_rate ?? undefined,
      peakStart: row.peak_start ?? undefined,
      peakEnd: row.peak_end ?? undefined,
    },
  })
})

partners.put('/tariffs/:parkingId', zValidator('json', TariffSchema), (c) => {
  const userId = getUserId(c)
  if (!requirePartner(userId)) return c.json({ error: 'Partner access required' }, 403)

  const parkingId = c.req.param('parkingId')
  const data = c.req.valid('json')

  const owned = db
    .prepare('SELECT id FROM parking_locations WHERE id = ? AND partner_id = ?')
    .get(parkingId, userId) as { id: string } | undefined

  if (!owned) {
    return c.json({ error: 'Parking location not found' }, 404)
  }

  db.prepare(
    'INSERT OR REPLACE INTO tariffs (parking_id, base_rate, peak_rate, peak_start, peak_end) VALUES (?, ?, ?, ?, ?)'
  ).run(
    parkingId,
    data.baseRate,
    data.peakRate ?? null,
    data.peakStart ?? null,
    data.peakEnd ?? null
  )

  return c.json({ ok: true })
})

partners.get('/kpis', (c) => {
  const userId = getUserId(c)
  if (!requirePartner(userId)) return c.json({ error: 'Partner access required' }, 403)

  const totals = db
    .prepare(
      `SELECT COUNT(*) as reservations, SUM(total_amount) as revenue
       FROM reservations
       WHERE parking_id IN (SELECT id FROM parking_locations WHERE partner_id = ?)`
    )
    .get(userId) as { reservations: number; revenue: number | null }

  const capacity = db
    .prepare(
      `SELECT SUM(total_spots) as totalSpots, SUM(available_spots) as availableSpots
       FROM parking_locations WHERE partner_id = ?`
    )
    .get(userId) as { totalSpots: number | null; availableSpots: number | null }

  return c.json({
    kpis: {
      totalReservations: totals.reservations ?? 0,
      totalRevenue: totals.revenue ?? 0,
      totalSpots: capacity.totalSpots ?? 0,
      availableSpots: capacity.availableSpots ?? 0,
    },
  })
})

export default partners
