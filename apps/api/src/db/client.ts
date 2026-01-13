import fs from 'node:fs'
import path from 'node:path'

import Database from 'better-sqlite3'

type DbStatement<Result> = {
  get: (...params: unknown[]) => Result | undefined
  all: (...params: unknown[]) => Result[]
  run: (...params: unknown[]) => { changes: number }
}

type DbClient = {
  pragma: (value: string) => void
  exec: (sql: string) => void
  prepare: <Result = unknown>(sql: string) => DbStatement<Result>
}

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./data/parkapp.db'
const dbPath = databaseUrl.startsWith('sqlite:') ? databaseUrl.replace('sqlite:', '') : databaseUrl
const resolvedPath = path.resolve(process.cwd(), dbPath)

fs.mkdirSync(path.dirname(resolvedPath), { recursive: true })

const dbRaw = new Database(resolvedPath)
export const db: DbClient = dbRaw as unknown as DbClient

db.pragma('journal_mode = WAL')

// Tabla para almacenar las transacciones del CSV
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

export const jsonParse = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}
