import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import Database from 'better-sqlite3'

import { getEnv } from '../config/env.js'

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

const env = getEnv()
const databaseUrl = env.DATABASE_URL || 'sqlite:./data/parkapp.db'
const dbPath = databaseUrl.startsWith('sqlite:')
  ? databaseUrl.replace('sqlite:', '')
  : databaseUrl
const resolvedPath = path.resolve(process.cwd(), dbPath)

fs.mkdirSync(path.dirname(resolvedPath), { recursive: true })

const dbRaw = new Database(resolvedPath)
export const db: DbClient = dbRaw as unknown as DbClient

db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plate TEXT NOT NULL,
    make TEXT,
    model TEXT,
    color TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS partner_profiles (
    user_id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS parking_locations (
    id TEXT PRIMARY KEY,
    partner_id TEXT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    total_spots INTEGER NOT NULL,
    available_spots INTEGER NOT NULL,
    hourly_rate REAL NOT NULL,
    type TEXT NOT NULL,
    amenities TEXT NOT NULL,
    images TEXT NOT NULL,
    operating_hours TEXT NOT NULL,
    rating REAL NOT NULL,
    review_count INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS tariffs (
    parking_id TEXT PRIMARY KEY,
    base_rate REAL NOT NULL,
    peak_rate REAL,
    peak_start TEXT,
    peak_end TEXT,
    FOREIGN KEY (parking_id) REFERENCES parking_locations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT NOT NULL,
    parking_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, parking_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parking_id) REFERENCES parking_locations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    parking_id TEXT NOT NULL,
    status TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    vehicle_plate TEXT NOT NULL,
    total_amount REAL NOT NULL,
    qr_code TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parking_id) REFERENCES parking_locations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    reservation_id TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    method TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`)

const seedParking = () => {
  const row = db.prepare('SELECT COUNT(*) as count FROM parking_locations').get() as {
    count: number
  }

  if (row.count > 0) return

  const now = new Date().toISOString()
  const insert = db.prepare(`
    INSERT INTO parking_locations (
      id, partner_id, name, address, lat, lng, total_spots, available_spots, hourly_rate, type,
      amenities, images, operating_hours, rating, review_count, created_at
    ) VALUES (
      @id, @partnerId, @name, @address, @lat, @lng, @totalSpots, @availableSpots, @hourlyRate, @type,
      @amenities, @images, @operatingHours, @rating, @reviewCount, @createdAt
    )
  `)

  const sample = [
    {
      name: 'Centro Histórico Parking',
      address: 'Av. García Moreno 123, Centro',
      lat: -0.2201,
      lng: -78.5123,
      totalSpots: 120,
      availableSpots: 24,
      hourlyRate: 2.5,
      type: 'covered',
      amenities: ['CCTV', 'Guard', 'EV Charging'],
    },
    {
      name: 'La Mariscal Open Lot',
      address: 'Calle Reina Victoria 45, La Mariscal',
      lat: -0.2102,
      lng: -78.4979,
      totalSpots: 80,
      availableSpots: 12,
      hourlyRate: 1.8,
      type: 'uncovered',
      amenities: ['24/7', 'Lighting'],
    },
    {
      name: 'El Jardín Mall',
      address: 'Av. República 390, Iñaquito',
      lat: -0.1773,
      lng: -78.4787,
      totalSpots: 260,
      availableSpots: 66,
      hourlyRate: 3.0,
      type: 'mixed',
      amenities: ['CCTV', 'Restrooms', 'Covered'],
    },
    {
      name: 'Cumbayá Plaza',
      address: 'Av. Pampite, Cumbayá',
      lat: -0.2021,
      lng: -78.4379,
      totalSpots: 140,
      availableSpots: 40,
      hourlyRate: 2.2,
      type: 'covered',
      amenities: ['Security', 'Valet'],
    },
    {
      name: 'Aeropuerto Express',
      address: 'Av. Amazonas y Av. 6 de Diciembre',
      lat: -0.1354,
      lng: -78.4972,
      totalSpots: 300,
      availableSpots: 98,
      hourlyRate: 4.5,
      type: 'covered',
      amenities: ['CCTV', 'Guard', 'Shuttle'],
    },
  ]

  for (const entry of sample) {
    insert.run({
      id: crypto.randomUUID(),
      partnerId: null,
      name: entry.name,
      address: entry.address,
      lat: entry.lat,
      lng: entry.lng,
      totalSpots: entry.totalSpots,
      availableSpots: entry.availableSpots,
      hourlyRate: entry.hourlyRate,
      type: entry.type,
      amenities: JSON.stringify(entry.amenities),
      images: JSON.stringify([]),
      operatingHours: JSON.stringify({
        opensAt: '07:00',
        closesAt: '22:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      }),
      rating: 4.3,
      reviewCount: 120,
      createdAt: now,
    })
  }
}

seedParking()

export const jsonParse = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}
