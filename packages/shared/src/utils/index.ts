export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function generateQRCode(content: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let result = ''

  for (let i = 0; i < content.length; i += 3) {
    const a = content.charCodeAt(i)
    const b = content.charCodeAt(i + 1) || 0
    const c = content.charCodeAt(i + 2) || 0

    const bitmap = (a << 16) | (b << 8) | c

    result += chars.charAt((bitmap >> 18) & 63)
    result += chars.charAt((bitmap >> 12) & 63)
    result += chars.charAt((bitmap >> 6) & 63)
    result += chars.charAt(bitmap & 63)
  }

  const padding = content.length % 3
  if (padding > 0) {
    result = result.slice(0, -padding) + '===='.slice(padding)
  }

  return result
}

export function formatCurrency(cents: bigint): string {
  const dollars = Number(cents) / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars)
}

export function centsToDollars(cents: bigint): number {
  return Number(cents) / 100
}

export function dollarsToCents(dollars: number): bigint {
  return BigInt(Math.round(dollars * 100))
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}m`
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateVehiclePlate(plate: string): boolean {
  const plateRegex = /^[A-Z0-9-]+$/i
  return plateRegex.test(plate) && plate.length >= 1 && plate.length <= 10
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}
