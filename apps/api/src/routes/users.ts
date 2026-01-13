import crypto from 'node:crypto'

import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { zValidator } from '@hono/zod-validator'

import type { Variables } from '../types/env.js'
import { CreateVehicleSchema, UpdateUserSchema } from '@park-app/shared/schemas'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/client.js'

const users = new Hono<{ Variables: Variables }>()

const getUserId = (c: { get: (key: 'userId') => string | undefined }): string => {
  const userId: string | undefined = c.get('userId')
  if (!userId) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  return userId
}

users.use('*', authMiddleware)

users.get('/me', (c) => {
  const userId = getUserId(c)
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as {
    id: string
    email: string
    name: string
    phone_number: string | null
    created_at: string
    role: string
  }

  return c.json({
    id: row.id,
    email: row.email,
    name: row.name,
    phoneNumber: row.phone_number ?? undefined,
    role: row.role,
    createdAt: row.created_at,
  })
})

users.patch('/me', zValidator('json', UpdateUserSchema), (c) => {
  const userId = getUserId(c)
  const data = c.req.valid('json')

  db.prepare('UPDATE users SET name = ?, phone_number = ? WHERE id = ?').run(
    data.name,
    data.phoneNumber ?? null,
    userId
  )

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as {
    id: string
    email: string
    name: string
    phone_number: string | null
    created_at: string
    role: string
  }

  return c.json({
    id: row.id,
    email: row.email,
    name: row.name,
    phoneNumber: row.phone_number ?? undefined,
    role: row.role,
    createdAt: row.created_at,
  })
})

users.get('/me/vehicles', (c) => {
  const userId = getUserId(c)
  const vehicles = db
    .prepare('SELECT * FROM vehicles WHERE user_id = ? ORDER BY plate ASC')
    .all(userId) as Array<{
    id: string
    user_id: string
    plate: string
    make: string | null
    model: string | null
    color: string | null
  }>

  return c.json({
    vehicles: vehicles.map((vehicle) => ({
      id: vehicle.id,
      plate: vehicle.plate,
      make: vehicle.make ?? undefined,
      model: vehicle.model ?? undefined,
      color: vehicle.color ?? undefined,
    })),
  })
})

users.post('/me/vehicles', zValidator('json', CreateVehicleSchema), (c) => {
  const userId = getUserId(c)
  const data = c.req.valid('json')

  const id = crypto.randomUUID()
  db.prepare(
    'INSERT INTO vehicles (id, user_id, plate, make, model, color) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, userId, data.plate, data.make ?? null, data.model ?? null, data.color ?? null)

  return c.json(
    {
      id,
      plate: data.plate,
      make: data.make ?? undefined,
      model: data.model ?? undefined,
      color: data.color ?? undefined,
    },
    201
  )
})

users.delete('/me/vehicles/:id', (c) => {
  const userId = getUserId(c)
  const vehicleId = c.req.param('id')

  const deleted = db
    .prepare('DELETE FROM vehicles WHERE id = ? AND user_id = ?')
    .run(vehicleId, userId)

  if (deleted.changes === 0) {
    return c.json({ error: 'Vehicle not found' }, 404)
  }

  return c.json({ ok: true })
})

export default users
