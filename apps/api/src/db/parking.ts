import { jsonParse } from './client.js'

export type ParkingRow = {
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

const defaultOperatingHours = {
  opensAt: '07:00',
  closesAt: '22:00',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
}

export const toParkingDto = (row: ParkingRow) => ({
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
  operatingHours: jsonParse(row.operating_hours, defaultOperatingHours),
  rating: row.rating,
  reviewCount: row.review_count,
  createdAt: row.created_at,
})
