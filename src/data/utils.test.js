import { describe, it, expect } from 'vitest'
import { safeString, formatCurrency, formatDate, formatTime, today, nightPrice, computeBookingTotal, statusColor } from './utils'

describe('formatTime', () => {
  it('converts 24h to 12h with AM/PM', () => {
    expect(formatTime('14:00')).toBe('2:00 PM')
    expect(formatTime('00:00')).toBe('12:00 AM')
    expect(formatTime('12:30')).toBe('12:30 PM')
    expect(formatTime('09:05')).toBe('9:05 AM')
    expect(formatTime('23:59')).toBe('11:59 PM')
  })

  it('passes through non-time values and empty input', () => {
    expect(formatTime('')).toBe('')
    expect(formatTime('2PM')).toBe('2PM')
    expect(formatTime(undefined)).toBe('')
  })
})

describe('formatCurrency', () => {
  it('formats with default rupee symbol and en-IN grouping', () => {
    expect(formatCurrency(1234.5)).toBe('₹1,234.5')
    expect(formatCurrency(0)).toBe('₹0')
  })

  it('uses a provided symbol', () => {
    expect(formatCurrency(1234.5, '$')).toBe('$1,234.5')
  })
})

describe('formatDate', () => {
  it('formats ISO dates as dd/mm/yyyy', () => {
    expect(formatDate('2026-08-06')).toBe('06/08/2026')
    expect(formatDate('2026-12-01')).toBe('01/12/2026')
  })
})

describe('safeString', () => {
  it('returns fallback for null and undefined', () => {
    expect(safeString(null)).toBe('—')
    expect(safeString(undefined)).toBe('—')
  })

  it('returns stringified values', () => {
    expect(safeString('x')).toBe('x')
    expect(safeString(0)).toBe('0')
  })
})

describe('today', () => {
  it('returns an ISO date string', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('nightPrice', () => {
  const room = { price: 1000, weekendPrice: 1200 }

  it('applies weekend price on Friday and Saturday', () => {
    expect(nightPrice(room, '2026-08-07', 1)).toBe(1200)
    expect(nightPrice(room, '2026-08-08', 1)).toBe(1200)
  })

  it('applies base price on weekdays', () => {
    expect(nightPrice(room, '2026-08-03', 1)).toBe(1000)
  })

  it('sums across nights', () => {
    expect(nightPrice(room, '2026-08-07', 3)).toBe(3400)
  })
})

describe('computeBookingTotal', () => {
  const room = { type: 'Standard', price: 1000, weekendPrice: 1200 }

  it('applies tax to the base total', () => {
    expect(computeBookingTotal(room, '2026-08-03', 2, 5)).toBe(2100)
  })

  it('applies seasonal adjustments for matching room types', () => {
    const rules = [{ isActive: true, roomTypes: [], startDate: '2026-08-01', endDate: '2026-08-31', adjustment: 10 }]
    expect(computeBookingTotal(room, '2026-08-03', 2, 5, rules)).toBe(2310)
  })

  it('ignores seasonal rules for non-matching room types', () => {
    const rules = [{ isActive: true, roomTypes: ['Deluxe'], startDate: '2026-08-01', endDate: '2026-08-31', adjustment: 10 }]
    expect(computeBookingTotal(room, '2026-08-03', 2, 5, rules)).toBe(2100)
  })
})

describe('statusColor', () => {
  it('maps known statuses to their color classes', () => {
    expect(statusColor('Confirmed')).toContain('emerald')
    expect(statusColor('Pending')).toContain('yellow')
    expect(statusColor('Cancelled')).toContain('red')
    expect(statusColor('Checked Out')).toContain('blue')
    expect(statusColor('Whatever')).toContain('slate')
  })
})
