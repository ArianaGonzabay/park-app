import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { Writable } from 'node:stream'

import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { convertTransactionsCsvToParquet } from '../services/csv-to-parquet.js'

type ImportJobStatus = 'queued' | 'uploading' | 'converting' | 'completed' | 'failed'

type ImportJob = {
  id: string
  createdAt: string
  status: ImportJobStatus
  error?: string
  bytesReceived: number
  totalBytes?: number
  processedRows?: number
  failedRows?: number
  outputDir?: string
  inputCsvPath?: string
}

const jobs = new Map<string, ImportJob>()

const uploadsDir = path.resolve(process.cwd(), 'uploads')
const partitionsDir = path.resolve(process.cwd(), 'data', 'partitions')

async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true })
}

export const importsRoutes = new Hono()

importsRoutes.get('/', (c) => {
  const items = Array.from(jobs.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return c.json({ jobs: items.slice(0, 50) })
})

importsRoutes.get('/:id', (c) => {
  const id = c.req.param('id')
  const job = jobs.get(id)
  if (!job) {
    throw new HTTPException(404, { message: 'Job not found' })
  }
  return c.json(job)
})

importsRoutes.post('/', async (c) => {
  const contentType = c.req.header('content-type') ?? ''
  if (!contentType.includes('text/csv') && !contentType.includes('application/octet-stream')) {
    throw new HTTPException(415, { message: 'Expected Content-Type text/csv' })
  }

  const totalBytesHeader = c.req.header('content-length')
  const totalBytes = totalBytesHeader ? Number(totalBytesHeader) : undefined

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await ensureDir(uploadsDir)
  await ensureDir(partitionsDir)

  const inputCsvPath = path.join(uploadsDir, `${id}.csv`)
  const outputDir = path.join(partitionsDir, id)

  const job: ImportJob = {
    id,
    createdAt,
    status: 'uploading',
    bytesReceived: 0,
    totalBytes,
    inputCsvPath,
    outputDir,
  }

  jobs.set(id, job)

  const body = c.req.raw.body
  if (!body) {
    job.status = 'failed'
    job.error = 'Missing request body'
    return c.json(job, 400)
  }

  const writeStream = fs.createWriteStream(inputCsvPath)

  try {
    const webWritable = Writable.toWeb(writeStream)
    const progressStream = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        job.bytesReceived += chunk.byteLength
        controller.enqueue(chunk)
      },
    })

    await body.pipeThrough(progressStream).pipeTo(webWritable)
  } catch (streamError) {
    job.status = 'failed'
    job.error = streamError instanceof Error ? streamError.message : String(streamError)
    return c.json(job, 500)
  }

  job.status = 'converting'

  void (async () => {
    try {
      const { processed, failed } = await convertTransactionsCsvToParquet({
        inputCsvPath,
        outputDir,
      })

      job.status = 'completed'
      job.processedRows = processed
      job.failedRows = failed
    } catch (err) {
      job.status = 'failed'
      job.error = err instanceof Error ? err.message : String(err)
    }
  })()

  return c.json(job, 202)
})
