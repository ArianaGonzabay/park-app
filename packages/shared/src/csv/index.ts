import { z } from 'zod'

export type CsvTransactionRowRaw = {
  ID: string
  Source: string
  'Duration in Minutes': string
  'Start Time': string
  'End Time': string
  Amount: string
  'Kiosk ID': string
  'App Zone ID': string
  'App Zone Group': string
  'Payment Method': string
  'Location Group': string
  'Last Updated': string
}

export const CsvTransactionRowRawSchema = z.object({
  ID: z.string().min(1),
  Source: z.string().min(1),
  'Duration in Minutes': z.string().min(1),
  'Start Time': z.string().min(1),
  'End Time': z.string().min(1),
  Amount: z.string().min(1),
  'Kiosk ID': z.string().min(1),
  'App Zone ID': z.string().optional().default(''),
  'App Zone Group': z.string().optional().default(''),
  'Payment Method': z.string().min(1),
  'Location Group': z.string().optional().default(''),
  'Last Updated': z.string().min(1),
})

const parseUsDateTime = (value: unknown): Date => {
  if (typeof value !== 'string') {
    throw new Error(`Expected string, got ${typeof value}`)
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid datetime: ${value}`)
  }
  return d
}

export const TransactionRecordSchema = CsvTransactionRowRawSchema.transform((r) => {
  const amount = Number(r.Amount)
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid amount: ${r.Amount}`)
  }

  return {
    id: Number(r.ID),
    source: r.Source,
    durationMinutes: Number(r['Duration in Minutes']),
    startTime: parseUsDateTime(r['Start Time']),
    endTime: parseUsDateTime(r['End Time']),
    amountCents: BigInt(Math.round(amount * 100)),
    kioskId: r['Kiosk ID'],
    appZoneId: r['App Zone ID'] || undefined,
    appZoneGroup: r['App Zone Group'] || undefined,
    paymentMethod: r['Payment Method'],
    locationGroup: r['Location Group'] || undefined,
    lastUpdated: parseUsDateTime(r['Last Updated']),
  }
})

export type TransactionRecord = z.infer<typeof TransactionRecordSchema>

export const RevenueAnalyticsQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  groupBy: z.enum(['day', 'kiosk', 'zone', 'paymentMethod']).default('day'),
})

export const TransactionListQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  cursor: z.string().optional(),
})

export interface CsvProcessingProgress {
  bytesRead: number
  totalBytes: number
  percentage: number
  recordsProcessed: number
  recordsFailed: number
}

export interface CsvProcessingResult {
  recordsProcessed: number
  recordsFailed: number
  durationMs: number
}
