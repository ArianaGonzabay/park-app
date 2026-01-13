import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import type { Variables } from '../types/env.js'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/client.js'

const notifications = new Hono<{ Variables: Variables }>()

const getUserId = (c: { get: (key: 'userId') => string | undefined }): string => {
  const userId: string | undefined = c.get('userId')
  if (!userId) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  return userId
}

notifications.use('*', authMiddleware)

notifications.get('/', (c) => {
  const userId = getUserId(c)
  const rows = db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY datetime(created_at) DESC')
    .all(userId) as Array<{
    id: string
    type: string
    message: string
    is_read: number
    created_at: string
  }>

  return c.json({
    notifications: rows.map((row) => ({
      id: row.id,
      type: row.type,
      message: row.message,
      isRead: Boolean(row.is_read),
      createdAt: row.created_at,
    })),
  })
})

notifications.post('/:id/read', (c) => {
  const userId = getUserId(c)
  const id = c.req.param('id')

  const updated = db
    .prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
    .run(id, userId)

  if (updated.changes === 0) {
    return c.json({ error: 'Notification not found' }, 404)
  }

  return c.json({ ok: true })
})

export default notifications
