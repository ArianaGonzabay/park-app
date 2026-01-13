import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { bodyLimit } from 'hono/body-limit'
import { stream } from 'hono/streaming'
import { HTTPException } from 'hono/http-exception'
import {
  RevenueAnalyticsQuerySchema,
  TransactionListQuerySchema,
  type CsvProcessingProgress,
  type CsvProcessingResult,
} from '@park-app/shared/csv'
import { CsvTransactionRowRawSchema, TransactionRecordSchema } from '@park-app/shared/csv'

const analytics = new Hono()

analytics.post(
  '/upload',
  bodyLimit({
    maxSize: 5 * 1024 * 1024 * 1024,
    onError: (c) => {
      return c.json({ error: 'File too large. Maximum size is 5GB' }, 413)
    },
  }),
  async (c) => {
    const contentType = c.req.header('Content-Type')

    if (!contentType?.includes('multipart/form-data')) {
      throw new HTTPException(400, {
        message: 'Content-Type must be multipart/form-data',
      })
    }

    return stream(c, async (stream) => {
      stream.onAbort(() => {
        console.log('Upload aborted by client')
      })

      try {
        const result = await processCsvUpload(c.req.raw, (progress) => {
          console.log(`Upload progress: ${progress.percentage.toFixed(2)}%`)
        })

        await stream.write(JSON.stringify(result))
      } catch (error) {
        console.error('CSV processing error:', error)
        throw new HTTPException(500, {
          message: 'Failed to process CSV file',
        })
      }
    })
  }
)

analytics.get('/revenue', zValidator('query', RevenueAnalyticsQuerySchema), (c) => {
  c.req.valid('query')
  return c.json({
    period: 'revenue placeholder',
    totalRevenue: 0,
    totalTransactions: 0,
    byPaymentMethod: {},
  })
})

analytics.get('/transactions', zValidator('query', TransactionListQuerySchema), (c) => {
  c.req.valid('query')
  return c.json({
    transactions: [],
    nextCursor: null,
  })
})

async function processCsvUpload(
  request: Request,
  _onProgress?: (progress: CsvProcessingProgress) => void
): Promise<CsvProcessingResult> {
  const startTime = Date.now()
  let recordsProcessed = 0
  let recordsFailed = 0

  try {
    const contentLength = request.headers.get('Content-Length')
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0

    const reader = request.body?.getReader()
    if (!reader) {
      throw new Error('No request body')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let bytesRead = 0

    let headerSkipped = false

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      bytesRead += value.length
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue

        if (!headerSkipped) {
          headerSkipped = true
          continue
        }

        try {
          const record = parseCsvLine(line)
          const validated = CsvTransactionRowRawSchema.parse(record)
          const _normalized = TransactionRecordSchema.parse(validated)

          recordsProcessed++

          if (recordsProcessed % 1000 === 0 && _onProgress) {
            _onProgress({
              bytesRead,
              totalBytes,
              percentage: totalBytes > 0 ? (bytesRead / totalBytes) * 100 : 0,
              recordsProcessed,
              recordsFailed,
            })
          }
        } catch {
          recordsFailed++
        }
      }
    }

    return {
      recordsProcessed,
      recordsFailed,
      durationMs: Date.now() - startTime,
    }
  } catch {
    throw new Error('Failed to process CSV file')
  }
}

function parseCsvLine(line: string): Record<string, string> {
  const values = splitCsvLine(line)

  const columns = [
    'ID',
    'Source',
    'Duration in Minutes',
    'Start Time',
    'End Time',
    'Amount',
    'Kiosk ID',
    'App Zone ID',
    'App Zone Group',
    'Payment Method',
    'Location Group',
    'Last Updated',
  ]

  const record: Record<string, string> = {}

  for (let i = 0; i < columns.length; i++) {
    const key = columns[i]
    if (key) {
      record[key] = values[i] || ''
    }
  }

  return record
}

function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

export default analytics
