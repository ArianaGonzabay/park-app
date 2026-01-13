import fs from 'node:fs'
import path from 'node:path'

import { parse } from 'csv-parse'
import { ParquetSchema, ParquetWriter } from '@dsnp/parquetjs'

import { TransactionRecordSchema, type TransactionRecord } from '@park-app/shared/csv'

type PartitionKey = string

type WriterEntry = {
  key: PartitionKey
  writer: ParquetWriter
  lastUsedAt: number
}

const schema = new ParquetSchema({
  id: { type: 'INT64' },
  source: { type: 'UTF8' },
  durationMinutes: { type: 'INT32' },
  startTime: { type: 'TIMESTAMP_MILLIS' },
  endTime: { type: 'TIMESTAMP_MILLIS' },
  amountCents: { type: 'INT64' },
  kioskId: { type: 'UTF8' },
  appZoneId: { type: 'UTF8', optional: true },
  appZoneGroup: { type: 'UTF8', optional: true },
  paymentMethod: { type: 'UTF8' },
  locationGroup: { type: 'UTF8', optional: true },
  lastUpdated: { type: 'TIMESTAMP_MILLIS' },
})

const toPartitionKey = (d: Date): PartitionKey => {
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd}`
}

const normalizeForParquet = (r: TransactionRecord) => {
  return {
    id: BigInt(r.id),
    source: r.source,
    durationMinutes: r.durationMinutes,
    startTime: r.startTime,
    endTime: r.endTime,
    amountCents: r.amountCents,
    kioskId: r.kioskId,
    appZoneId: r.appZoneId,
    appZoneGroup: r.appZoneGroup,
    paymentMethod: r.paymentMethod,
    locationGroup: r.locationGroup,
    lastUpdated: r.lastUpdated,
  }
}

async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true })
}

export async function convertTransactionsCsvToParquet(options: {
  inputCsvPath: string
  outputDir: string
  maxOpenWriters?: number
}): Promise<{ processed: number; failed: number }> {
  const maxOpenWriters = options.maxOpenWriters ?? 16
  const writers = new Map<PartitionKey, WriterEntry>()

  let processed = 0
  let failed = 0

  const closeLeastRecentlyUsed = async () => {
    if (writers.size <= maxOpenWriters) return

    let lru: WriterEntry | undefined
    for (const entry of writers.values()) {
      if (!lru || entry.lastUsedAt < lru.lastUsedAt) {
        lru = entry
      }
    }

    if (!lru) return

    writers.delete(lru.key)
    await lru.writer.close()
  }

  const getWriter = async (key: PartitionKey): Promise<ParquetWriter> => {
    const existing = writers.get(key)
    if (existing) {
      existing.lastUsedAt = Date.now()
      return existing.writer
    }

    const dir = path.join(options.outputDir, key)
    await ensureDir(dir)

    const filePath = path.join(dir, 'part-00001.parquet')
    const writer = await ParquetWriter.openFile(schema, filePath)

    writers.set(key, { key, writer, lastUsedAt: Date.now() })
    await closeLeastRecentlyUsed()

    return writer
  }

  const parser = parse({
    columns: true,
    bom: true,
    relax_quotes: true,
    trim: true,
    skip_empty_lines: true,
  })

  const inputStream = fs.createReadStream(options.inputCsvPath)
  const parsedStream = inputStream.pipe(parser)

  for await (const record of parsedStream) {
    try {
      const normalized = TransactionRecordSchema.parse(record)

      const key = toPartitionKey(normalized.startTime)
      const writer = await getWriter(key)
      await writer.appendRow(normalizeForParquet(normalized))

      processed++
      if (processed % 100000 === 0) {
        console.log(
          `Processed ${processed.toLocaleString()} rows (failed ${failed.toLocaleString()})`
        )
      }
    } catch (err) {
      failed++
      if (failed <= 5) {
        console.warn('Failed row', err)
      }
    }
  }

  for (const entry of writers.values()) {
    await entry.writer.close()
  }

  return { processed, failed }
}
