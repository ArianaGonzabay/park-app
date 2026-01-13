import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'

import { optionalAuthMiddleware } from '../middleware/auth.js'
import { ParkingFilterSchema } from '@park-app/shared/schemas'
import { db, jsonParse } from '../db/client.js'

const parking = new Hono()

const toRadians = (value: number) => (value * Math.PI) / 180
const distanceMeters = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const r = 6371000
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng

  return 2 * r * Math.asin(Math.sqrt(h))
}

parking.get('/', optionalAuthMiddleware, zValidator('query', ParkingFilterSchema), (c) => {
  const filters = c.req.valid('query')

  const rows = db.prepare('SELECT * FROM parking_locations').all() as Array<{
    id: string
    partner_id: string | null
    name: string
    address: string
    lat: number
    lng: number
    total_spots: number
    available_spots: number
    hourly_rate: number
    type: string
    amenities: string
    images: string
    operating_hours: string
    rating: number
    review_count: number
    created_at: string
  }>

  let parkingSpots = rows.map((row) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    location: { lat: row.lat, lng: row.lng },
    totalSpots: row.total_spots,
    availableSpots: row.available_spots,
    hourlyRate: row.hourly_rate,
    type: row.type,
    amenities: jsonParse<string[]>(row.amenities, []),
    images: jsonParse<string[]>(row.images, []),
    operatingHours: jsonParse(row.operating_hours, {
      opensAt: '07:00',
      closesAt: '22:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    }),
    rating: row.rating,
    reviewCount: row.review_count,
    createdAt: row.created_at,
  }))

  if (filters.type) {
    parkingSpots = parkingSpots.filter((spot) => spot.type === filters.type)
  }

  const minPrice = filters.minPrice
  if (minPrice !== undefined) {
    parkingSpots = parkingSpots.filter((spot) => spot.hourlyRate >= minPrice)
  }

  const maxPrice = filters.maxPrice
  if (maxPrice !== undefined) {
    parkingSpots = parkingSpots.filter((spot) => spot.hourlyRate <= maxPrice)
  }

  if (filters.amenities?.length) {
    parkingSpots = parkingSpots.filter((spot) =>
      filters.amenities?.every((amenity) => spot.amenities.includes(amenity))
    )
  }

  if (filters.lat !== undefined && filters.lng !== undefined) {
    const center = { lat: filters.lat, lng: filters.lng }
    parkingSpots = parkingSpots
      .map((spot) => ({
        ...spot,
        distance: distanceMeters(center, spot.location),
      }))
      .filter((spot) => spot.distance <= filters.radius)
      .sort((a, b) => a.distance - b.distance)
  }

  return c.json({ parkingSpots, filters })
})

parking.get('/:id', optionalAuthMiddleware, (c) => {
  const id = c.req.param('id')

  const row = db.prepare('SELECT * FROM parking_locations WHERE id = ?').get(id) as
    | {
        id: string
        name: string
        address: string
        lat: number
        lng: number
        total_spots: number
        available_spots: number
        hourly_rate: number
        type: string
        amenities: string
        images: string
        operating_hours: string
        rating: number
        review_count: number
        created_at: string
      }
    | undefined

  if (!row) {
    return c.json({ error: 'Parking location not found' }, 404)
  }

  return c.json({
    parking: {
      id: row.id,
      name: row.name,
      address: row.address,
      location: { lat: row.lat, lng: row.lng },
      totalSpots: row.total_spots,
      availableSpots: row.available_spots,
      hourlyRate: row.hourly_rate,
      type: row.type,
      amenities: jsonParse<string[]>(row.amenities, []),
      images: jsonParse<string[]>(row.images, []),
      operatingHours: jsonParse(row.operating_hours, {
        opensAt: '07:00',
        closesAt: '22:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      }),
      rating: row.rating,
      reviewCount: row.review_count,
      createdAt: row.created_at,
    },
  })
})

export default parking
