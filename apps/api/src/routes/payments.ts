import crypto from 'node:crypto'

import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { zValidator } from '@hono/zod-validator'

import type { Variables } from '../types/env.js'
import { CreateCheckoutSessionSchema } from '@park-app/shared/schemas'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/client.js'

const payments = new Hono<{ Variables: Variables }>()

const getUserId = (c: { get: (key: 'userId') => string | undefined }): string => {
  const userId: string | undefined = c.get('userId')
  if (!userId) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  return userId
}

payments.use('*', authMiddleware)

payments.post('/checkout', zValidator('json', CreateCheckoutSessionSchema), (c) => {
  const userId = getUserId(c)
  const data = c.req.valid('json')

  const reservation = db
    .prepare('SELECT * FROM reservations WHERE id = ? AND user_id = ?')
    .get(data.reservationId, userId) as
    | {
        id: string
        total_amount: number
        status: string
      }
    | undefined

  if (!reservation) {
    return c.json({ error: 'Reservation not found' }, 404)
  }

  const paymentId = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  db.prepare(
    'INSERT INTO payments (id, reservation_id, amount, status, method, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(paymentId, reservation.id, reservation.total_amount, 'completed', 'mock-card', createdAt)

  if (reservation.status === 'pending') {
    db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run('confirmed', reservation.id)
  }

  db.prepare(
    'INSERT INTO notifications (id, user_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    crypto.randomUUID(),
    userId,
    'payment_success',
    `Pago confirmado por $${reservation.total_amount.toFixed(2)}`,
    0,
    createdAt
  )

  return c.json({
    payment: {
      id: paymentId,
      reservationId: reservation.id,
      amount: reservation.total_amount,
      status: 'completed',
      method: 'mock-card',
      createdAt,
    },
  })
})

payments.get('/:reservationId', (c) => {
  const userId = getUserId(c)
  const reservationId = c.req.param('reservationId')

  const payment = db
    .prepare(
      `SELECT payments.* FROM payments
       JOIN reservations ON reservations.id = payments.reservation_id
       WHERE reservations.user_id = ? AND payments.reservation_id = ?
       ORDER BY datetime(payments.created_at) DESC
       LIMIT 1`
    )
    .get(userId, reservationId) as
    | {
        id: string
        reservation_id: string
        amount: number
        status: string
        method: string
        created_at: string
      }
    | undefined

  if (!payment) {
    return c.json({ error: 'Payment not found' }, 404)
  }

  return c.json({
    payment: {
      id: payment.id,
      reservationId: payment.reservation_id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      createdAt: payment.created_at,
    },
  })
})

export default payments
