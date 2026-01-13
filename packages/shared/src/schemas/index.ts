import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  phoneNumber: z.string().optional(),
  createdAt: z.coerce.date(),
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
  phoneNumber: z.string().optional(),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100),
  phoneNumber: z.string().optional(),
})

export const VehicleSchema = z.object({
  id: z.string().uuid(),
  plate: z
    .string()
    .regex(/^[A-Z0-9-]+$/)
    .toUpperCase(),
  make: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
})

export const CreateVehicleSchema = z.object({
  plate: z
    .string()
    .regex(/^[A-Z0-9-]+$/)
    .min(1)
    .max(10),
  make: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
})

export const ParkingTypeSchema = z.enum(['covered', 'uncovered', 'mixed'])

export const ParkingAmenitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  icon: z.string().min(1),
})

export const OperatingHoursSchema = z.object({
  opensAt: z.string().regex(/^\d{2}:\d{2}$/),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/),
  days: z.array(
    z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
  ),
})

export const ParkingLocationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  address: z.string().min(1),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  totalSpots: z.number().int().positive(),
  availableSpots: z.number().int().min(0),
  hourlyRate: z.number().positive(),
  type: ParkingTypeSchema,
  amenities: z.array(ParkingAmenitySchema),
  images: z.array(z.string().url()),
  operatingHours: OperatingHoursSchema,
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().min(0),
  createdAt: z.coerce.date(),
})

export const CreateParkingLocationSchema = ParkingLocationSchema.omit({
  id: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
})

export const UpdateParkingLocationSchema = CreateParkingLocationSchema.partial()

export const UpdateParkingAvailabilitySchema = z.object({
  availableSpots: z.number().int().min(0),
})

export const PartnerOnboardSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
})

export const TariffSchema = z.object({
  baseRate: z.number().positive(),
  peakRate: z.number().positive().optional(),
  peakStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  peakEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

export const ParkingFilterSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0).max(50000).default(5000),
  type: ParkingTypeSchema.optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  amenities: z.array(z.string()).optional(),
})

export const ReservationStatusSchema = z.enum([
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'expired',
])

export const ReservationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  parkingId: z.string().uuid(),
  status: ReservationStatusSchema,
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  vehiclePlate: z.string().regex(/^[A-Z0-9-]+$/),
  totalAmount: z.number().positive(),
  qrCode: z.string().min(1),
  createdAt: z.coerce.date(),
})

export const CreateReservationSchema = z.object({
  parkingId: z.string().uuid(),
  startTime: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(1440),
  vehiclePlate: z.string().regex(/^[A-Z0-9-]+$/),
})

export const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['card', 'wallet']),
  lastFour: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
  brand: z.string().optional(),
})

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  reservationId: z.string().uuid(),
  amount: z.number().positive(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  method: z.string(),
  createdAt: z.coerce.date(),
})

export const CreateCheckoutSessionSchema = z.object({
  reservationId: z.string().uuid(),
})
