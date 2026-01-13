import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'

import { getEnv } from '../config/env.js'
import type { Variables } from '../types/env.js'

type AuthVariables = Variables

const env = getEnv()

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing or invalid Authorization header' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = await verify(token, env.JWT_SECRET, 'HS256')

    if (payload.type !== 'access') {
      throw new HTTPException(401, { message: 'Invalid token type' })
    }

    if (typeof payload.sub !== 'string') {
      throw new HTTPException(401, { message: 'Invalid token subject' })
    }

    c.set('userId', payload.sub)
    c.set('jwtPayload', payload)

    await next()
  } catch (err) {
    if (err instanceof HTTPException) throw err
    throw new HTTPException(401, { message: 'Invalid or expired token' })
  }
})

export const optionalAuthMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization')

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7)
        const payload = await verify(token, env.JWT_SECRET, 'HS256')

        if (payload.type === 'access' && typeof payload.sub === 'string') {
          c.set('userId', payload.sub)
          c.set('jwtPayload', payload)
        }
      } catch (err) {
        console.warn('optionalAuthMiddleware error', err)
      }
    }

    await next()
  }
)
