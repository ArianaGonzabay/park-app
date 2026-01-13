export interface User {
  id: string
  email: string
  name: string
  phoneNumber?: string
  createdAt: Date
}

export interface Vehicle {
  id: string
  plate: string
  make?: string
  model?: string
  color?: string
}

export interface ParkingLocation {
  id: string
  name: string
  address: string
  location: {
    lat: number
    lng: number
  }
  totalSpots: number
  availableSpots: number
  hourlyRate: number
  type: ParkingType
  amenities: ParkingAmenity[]
  images: string[]
  operatingHours: OperatingHours
  rating: number
  reviewCount: number
  createdAt: Date
}

export type ParkingType = 'covered' | 'uncovered' | 'mixed'

export interface ParkingAmenity {
  id: string
  name: string
  icon: string
}

export interface OperatingHours {
  opensAt: string
  closesAt: string
  days: DayOfWeek[]
}

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export interface ParkingFilter {
  lat?: number
  lng?: number
  radius?: number
  type?: ParkingType
  minPrice?: number
  maxPrice?: number
  amenities?: string[]
}

export interface Reservation {
  id: string
  userId: string
  parkingId: string
  status: ReservationStatus
  startTime: Date
  endTime: Date
  vehiclePlate: string
  totalAmount: number
  qrCode: string
  createdAt: Date
}

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'expired'

export interface CreateReservationInput {
  parkingId: string
  startTime: string
  durationMinutes: number
  vehiclePlate: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'wallet'
  lastFour?: string
  brand?: string
}

export interface Payment {
  id: string
  reservationId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  method: string
  createdAt: Date
}

export interface TransactionRecord {
  id: number
  source: string
  durationMinutes: number
  startTime: Date
  endTime: Date
  amountCents: bigint
  kioskId: string
  appZoneId?: string
  appZoneGroup?: string
  paymentMethod: string
  locationGroup?: string
  lastUpdated: Date
}

export interface RevenueAnalytics {
  period: string
  totalRevenue: number
  totalTransactions: number
  byPaymentMethod: Record<string, number>
  byKiosk?: Record<string, number>
  byZone?: Record<string, number>
}

export interface TransactionListResponse {
  transactions: TransactionRecord[]
  nextCursor: string | null
}

export type GroupBy = 'day' | 'kiosk' | 'zone' | 'paymentMethod'

export interface ApiResponse<T> {
  data: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  cursor?: string
}
