export interface Env {
  NODE_ENV: string
  PORT?: string
  DATABASE_URL: string
  JWT_SECRET: string
  JWT_REFRESH_SECRET: string
  CORS_ORIGIN: string
  STRIPE_SECRET_KEY?: string
  MAX_UPLOAD_SIZE_BYTES?: string
}

export interface Variables {
  userId?: string
  jwtPayload?: Record<string, unknown>
}
