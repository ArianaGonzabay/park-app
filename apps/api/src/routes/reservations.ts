import crypto from 'node:crypto'

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'

import type { Variables } from '../types/env.js'
import { authMiddleware } from '../middleware/auth.js'
import { requireUserId } from '../utils/auth.js'
import { CreateReservationSchema } from '@park-app/shared/schemas'
import { db } from '../db/client.js'

const reservations = new Hono<{ Variables: Variables }>()

const createNotification = (userId: string, type: string, message: string) => {
  db.prepare(
    'INSERT INTO notifications (id, user_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(crypto.randomUUID(), userId, type, message, 0, new Date().toISOString())
}

reservations.use('*', authMiddleware)

reservations.get('/', (c) => {
  const userId = requireUserId(c)
  const rows = db
    .prepare('SELECT * FROM reservations WHERE user_id = ? ORDER BY datetime(created_at) DESC')
    .all(userId) as Array<{
    id: string
    parking_id: string
    status: string
    start_time: string
    end_time: string
    duration_minutes: number
    vehicle_plate: string
    total_amount: number
    qr_code: string
    created_at: string
  }>

  return c.json({
    reservations: rows.map((row) => ({
      id: row.id,
      parkingId: row.parking_id,
      status: row.status,
      startTime: row.start_time,
      endTime: row.end_time,
      durationMinutes: row.duration_minutes,
      vehiclePlate: row.vehicle_plate,
      totalAmount: row.total_amount,
      qrCode: row.qr_code,
      createdAt: row.created_at,
    })),
  })
})

reservations.get('/:id', (c) => {
  const userId = requireUserId(c)
  const id = c.req.param('id')

  const row = db
    .prepare('SELECT * FROM reservations WHERE id = ? AND user_id = ?')
    .get(id, userId) as
    | {
        id: string
        parking_id: string
        status: string
        start_time: string
        end_time: string
        duration_minutes: number
        vehicle_plate: string
        total_amount: number
        qr_code: string
        created_at: string
      }
    | undefined

  if (!row) {
    return c.json({ error: 'Reservation not found' }, 404)
  }

  return c.json({
    reservation: {
      id: row.id,
      parkingId: row.parking_id,
      status: row.status,
      startTime: row.start_time,
      endTime: row.end_time,
      durationMinutes: row.duration_minutes,
      vehiclePlate: row.vehicle_plate,
      totalAmount: row.total_amount,
      qrCode: row.qr_code,
      createdAt: row.created_at,
    },
  })
})

reservations.post('/', zValidator('json', CreateReservationSchema), (c) => {
  const userId = requireUserId(c)
  const data = c.req.valid('json')

  const parking = db.prepare('SELECT * FROM parking_locations WHERE id = ?').get(data.parkingId) as
    | {
        id: string
        hourly_rate: number
        available_spots: number
      }
    | undefined

  if (!parking) {
    return c.json({ error: 'Parking location not found' }, 404)
  }

  if (parking.available_spots <= 0) {
    return c.json({ error: 'No availability for selected time' }, 409)
  }

  const id = crypto.randomUUID()
  const startTime = new Date(data.startTime)
  const endTime = new Date(startTime.getTime() + data.durationMinutes * 60000)
  const totalAmount = Math.round(parking.hourly_rate * (data.durationMinutes / 60) * 100) / 100
  const qrCode = `PARK-${id.slice(0, 8).toUpperCase()}`
  const createdAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO reservations (
      id, user_id, parking_id, status, start_time, end_time, duration_minutes, vehicle_plate,
      total_amount, qr_code, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    data.parkingId,
    'confirmed',
    startTime.toISOString(),
    endTime.toISOString(),
    data.durationMinutes,
    data.vehiclePlate,
    totalAmount,
    qrCode,
    createdAt
  )

  db.prepare('UPDATE parking_locations SET available_spots = available_spots - 1 WHERE id = ?').run(
    data.parkingId
  )

  createNotification(userId, 'reservation_confirmed', `Reserva confirmada #${qrCode}`)

  return c.json({
    reservation: {
      id,
      parkingId: data.parkingId,
      status: 'confirmed',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes: data.durationMinutes,
      vehiclePlate: data.vehiclePlate,
      totalAmount,
      qrCode,
      createdAt,
    },
  })
})

reservations.post('/:id/cancel', (c) => {
  const userId = requireUserId(c)
  const id = c.req.param('id')

  const row = db
    .prepare('SELECT * FROM reservations WHERE id = ? AND user_id = ?')
    .get(id, userId) as
    | {
        parking_id: string
        status: string
      }
    | undefined

  if (!row) {
    return c.json({ error: 'Reservation not found' }, 404)
  }

  if (row.status === 'cancelled') {
    return c.json({ error: 'Reservation already cancelled' }, 409)
  }

  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run('cancelled', id)
  db.prepare('UPDATE parking_locations SET available_spots = available_spots + 1 WHERE id = ?').run(
    row.parking_id
  )

  createNotification(userId, 'reservation_cancelled', `Reserva cancelada ${id.slice(0, 8)}`)

  return c.json({ ok: true })
})

export default reservations
