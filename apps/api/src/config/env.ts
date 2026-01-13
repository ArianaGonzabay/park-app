import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().optional(),
  DATABASE_URL: z.string().optional().default('sqlite:./data/parkapp.db'),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().default('*'),
  MAX_UPLOAD_SIZE_BYTES: z.string().optional(),
})

export type AppEnv = z.infer<typeof envSchema>

export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error('Invalid environment variables')
  }
  return parsed.data
}
