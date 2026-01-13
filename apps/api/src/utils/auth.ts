import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

import type { Variables } from '../types/env.js'

export const requireUserId = (c: Context<{ Variables: Variables }>): string => {
  const userId = c.get('userId')
  if (!userId) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  return userId
}
