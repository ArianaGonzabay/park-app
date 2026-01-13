import { sign } from 'hono/jwt'
import type { Env } from '../types/env.js'

export const generateTokens = async (
  userId: string,
  env: Env
): Promise<{ accessToken: string; refreshToken: string }> => {
  const now = Math.floor(Date.now() / 1000)

  const accessToken = await sign(
    {
      sub: userId,
      type: 'access',
      iat: now,
      exp: now + 15 * 60,
    },
    env.JWT_SECRET,
    'HS256'
  )

  const refreshToken = await sign(
    {
      sub: userId,
      type: 'refresh',
      iat: now,
      exp: now + 7 * 24 * 60 * 60,
    },
    env.JWT_REFRESH_SECRET,
    'HS256'
  )

  return { accessToken, refreshToken }
}
