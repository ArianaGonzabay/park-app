import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import type { Variables } from '../types/env.js'
import { authMiddleware } from '../middleware/auth.js'
import { db, jsonParse } from '../db/client.js'

const favorites = new Hono<{ Variables: Variables }>()

const getUserId = (c: { get: (key: 'userId') => string | undefined }): string => {
  const userId: string | undefined = c.get('userId')
  if (!userId) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  return userId
}

favorites.use('*', authMiddleware)

favorites.get('/', (c) => {
  const userId = getUserId(c)
  const rows = db
    .prepare(
      `SELECT parking_locations.* FROM favorites
       JOIN parking_locations ON parking_locations.id = favorites.parking_id
       WHERE favorites.user_id = ?
       ORDER BY favorites.created_at DESC`
    )
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
    favorites: rows.map((row) => ({
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

favorites.post('/:parkingId', (c) => {
  const userId = getUserId(c)
  const parkingId = c.req.param('parkingId')

  const exists = db
    .prepare('SELECT id FROM parking_locations WHERE id = ?')
    .get(parkingId) as { id: string } | undefined

  if (!exists) {
    return c.json({ error: 'Parking location not found' }, 404)
  }

  db.prepare(
    'INSERT OR IGNORE INTO favorites (user_id, parking_id, created_at) VALUES (?, ?, ?)'
  ).run(userId, parkingId, new Date().toISOString())

  return c.json({ ok: true }, 201)
})

favorites.delete('/:parkingId', (c) => {
  const userId = getUserId(c)
  const parkingId = c.req.param('parkingId')

  db.prepare('DELETE FROM favorites WHERE user_id = ? AND parking_id = ?').run(userId, parkingId)

  return c.json({ ok: true })
})

export default favorites
