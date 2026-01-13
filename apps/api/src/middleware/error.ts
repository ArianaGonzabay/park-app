import { HTTPException } from 'hono/http-exception'
import type { Context } from 'hono'

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

export const onError = (err: Error, c: Context) => {
  console.error('Error:', err)

  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  if (err instanceof ValidationError) {
    return c.json(
      {
        error: err.message,
        fields: err.fields,
      },
      400
    )
  }

  if (err instanceof NotFoundError) {
    return c.json(
      {
        error: err.message,
      },
      404
    )
  }

  if (err instanceof ConflictError) {
    return c.json(
      {
        error: err.message,
      },
      409
    )
  }

  return c.json(
    {
      error: 'Internal server error',
    },
    500
  )
}
