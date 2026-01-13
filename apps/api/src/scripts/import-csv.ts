import fs from 'node:fs'
import path from 'node:path'

import { parse } from 'csv-parse'
import Database from 'better-sqlite3'

const inputCsvPath = path.resolve(process.cwd(), '../../archive/Parking_Transactions.csv')
const dbPath = path.resolve(process.cwd(), './data/parkapp.db')

// Ensure data directory exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

// Open database
const dbRaw = new Database(dbPath)
const db = dbRaw as unknown as {
  prepare: <Result = unknown>(
    sql: string
  ) => {
    get: (...params: unknown[]) => Result | undefined
    all: (...params: unknown[]) => Result[]
    run: (...params: unknown[]) => { changes: number }
  }
  exec: (sql: string) => void
}

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    source TEXT NOT NULL,
    duration_minutes REAL NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    amount REAL NOT NULL,
    kiosk_id TEXT,
    app_zone_id TEXT,
    app_zone_group TEXT,
    payment_method TEXT NOT NULL,
    location_group TEXT,
    last_updated TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_start_time ON transactions(start_time);
  CREATE INDEX IF NOT EXISTS idx_transactions_location_group ON transactions(location_group);
  CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
`)

// Parse date in format "MM/DD/YYYY HH:MM:SS AM/PM"
function parseDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toISOString()
}

// Convert dollar amount to number
function parseAmount(amountStr: string): number {
  return parseFloat(amountStr)
}

// Convert duration to number
function parseDuration(durationStr: string): number {
  return parseFloat(durationStr)
}

const main = async () => {
  console.log(`Importing CSV from: ${inputCsvPath}`)

  // Check if data already exists
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get() as {
    count: number
  }

  if (existingCount.count > 0) {
    console.log(`Database already contains ${existingCount.count} transactions.`)
    console.log('Delete the database file to re-import or skip this step.')
    return
  }

  const insertStmt = db.prepare(`
    INSERT INTO transactions (
      id, source, duration_minutes, start_time, end_time, amount,
      kiosk_id, app_zone_id, app_zone_group, payment_method, location_group, last_updated
    ) VALUES (
      @id, @source, @durationMinutes, @startTime, @endTime, @amount,
      @kioskId, @appZoneId, @appZoneGroup, @paymentMethod, @locationGroup, @lastUpdated
    )
  `)

  const parser = parse({
    columns: true,
    bom: true,
    relax_quotes: true,
    trim: true,
    skip_empty_lines: true,
  })

  const inputStream = fs.createReadStream(inputCsvPath)
  const parsedStream = inputStream.pipe(parser)

  let processed = 0
  let failed = 0

  for await (const record of parsedStream) {
    try {
      insertStmt.run({
        id: parseInt(record.ID),
        source: record.Source || '',
        durationMinutes: parseDuration(record['Duration in Minutes']),
        startTime: parseDate(record['Start Time']),
        endTime: parseDate(record['End Time']),
        amount: parseAmount(record.Amount),
        kioskId: record['Kiosk ID'] || null,
        appZoneId: record['App Zone ID'] || null,
        appZoneGroup: record['App Zone Group'] || null,
        paymentMethod: record['Payment Method'] || '',
        locationGroup: record['Location Group'] || null,
        lastUpdated: parseDate(record['Last Updated']),
      })

      processed++
      if (processed % 10000 === 0) {
        console.log(
          `Processed ${processed.toLocaleString()} rows (failed ${failed.toLocaleString()})`
        )
      }
    } catch (err) {
      failed++
      if (failed <= 5) {
        console.warn('Failed row:', err)
        console.warn('Record:', record)
      }
    }
  }

  console.log(`\nImport complete!`)
  console.log(`Total processed: ${processed.toLocaleString()}`)
  console.log(`Total failed: ${failed.toLocaleString()}`)

  // Show some stats
  const stats = db
    .prepare(
      `
    SELECT 
      COUNT(*) as total_transactions,
      SUM(amount) as total_revenue,
      AVG(duration_minutes) as avg_duration,
      MIN(start_time) as earliest_transaction,
      MAX(start_time) as latest_transaction
    FROM transactions
  `
    )
    .get() as {
    total_transactions: number
    total_revenue: number
    avg_duration: number
    earliest_transaction: string
    latest_transaction: string
  }

  console.log('\nDatabase Statistics:')
  console.log(`Total Transactions: ${stats.total_transactions.toLocaleString()}`)
  console.log(
    `Total Revenue: $${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  )
  console.log(`Average Duration: ${stats.avg_duration.toFixed(2)} minutes`)
  console.log(`Date Range: ${stats.earliest_transaction} to ${stats.latest_transaction}`)
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exitCode = 1
})
