import crypto from 'node:crypto'

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { compare, hash } from 'bcryptjs'

import { CreateUserSchema, LoginSchema } from '@park-app/shared/schemas'
import { db } from '../db/client.js'
import { getEnv } from '../config/env.js'
import { generateTokens } from '../config/jwt.js'

const auth = new Hono()
const env = getEnv()

const serializeUser = (row: {
  id: string
  email: string
  name: string
  phone_number: string | null
  created_at: string
  role: string
}) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  phoneNumber: row.phone_number ?? undefined,
  role: row.role,
  createdAt: row.created_at,
})

auth.post('/register', zValidator('json', CreateUserSchema), async (c) => {
  const data = c.req.valid('json')

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email) as
    | { id: string }
    | undefined
  if (existing) {
    return c.json({ error: 'Email already registered' }, 409)
  }

  const id = crypto.randomUUID()
  const passwordHash = await hash(data.password, 10)
  const createdAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, phone_number, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, data.email, passwordHash, data.name, data.phoneNumber ?? null, 'driver', createdAt)

  const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as {
    id: string
    email: string
    name: string
    phone_number: string | null
    created_at: string
    role: string
  }

  const tokens = await generateTokens(id, env)
  return c.json({ user: serializeUser(userRow), ...tokens }, 201)
})

auth.post('/login', zValidator('json', LoginSchema), async (c) => {
  const data = c.req.valid('json')

  const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email) as
    | {
        id: string
        email: string
        name: string
        phone_number: string | null
        password_hash: string
        created_at: string
        role: string
      }
    | undefined

  if (!userRow) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const ok = await compare(data.password, userRow.password_hash)
  if (!ok) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const tokens = await generateTokens(userRow.id, env)
  return c.json({ user: serializeUser(userRow), ...tokens })
})

export default auth
