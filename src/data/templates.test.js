import { describe, it, expect } from 'vitest'
import { whatsappLink, confirmationMsg, preArrivalMsg, postStayMsg } from './templates'

describe('whatsappLink', () => {
  it('prefixes 10-digit numbers with 91', () => {
    expect(whatsappLink('9999999999', 'hi')).toBe('https://wa.me/919999999999?text=hi')
  })

  it('encodes message text', () => {
    expect(whatsappLink('+91 99999 99999', 'hello world')).toBe('https://wa.me/919999999999?text=hello%20world')
  })

  it('returns # for invalid numbers', () => {
    expect(whatsappLink('123', 'x')).toBe('#')
  })
})

describe('confirmationMsg', () => {
  const booking = { checkIn: '2026-08-06', checkOut: '2026-08-08', nights: 2, total: 2100 }
  const guest = { name: 'Asha' }
  const room = { name: 'Sea View' }
  const resort = { name: 'Shoreline', checkInTime: '14:00', checkOutTime: '11:00', address: 'Beach Rd', whatsappPhone: '9999999999' }

  it('builds a full confirmation with formatted times', () => {
    const msg = confirmationMsg(booking, guest, room, resort)
    expect(msg).toContain('Hi Asha! Your booking at Sea View is confirmed.')
    expect(msg).toContain('📅 2026-08-06 → 2026-08-08 (2 nights)')
    expect(msg).toContain('💰 Total: ₹2,100')
    expect(msg).toContain('🕑 Check-in: 2:00 PM · Check-out: 11:00 AM')
    expect(msg).toContain('📍 Beach Rd')
    expect(msg).toContain('Reply here or call 9999999999.')
  })

  it('falls back to defaults when resort fields are missing', () => {
    const msg = confirmationMsg(booking, guest, room, undefined)
    expect(msg).toContain('🕑 Check-in: 2:00 PM · Check-out: 11:00 AM')
    expect(msg).toContain('Reply here or call the resort.')
  })
})

describe('preArrivalMsg', () => {
  it('includes the resort name and formatted check-in time', () => {
    const msg = preArrivalMsg({}, { name: 'Asha' }, {}, { name: 'Shoreline', checkInTime: '14:00' })
    expect(msg).toContain('See you tomorrow at Shoreline 😊')
    expect(msg).toContain('• Check-in is at 2:00 PM')
  })

  it('falls back to default check-in time', () => {
    expect(preArrivalMsg({}, { name: 'Asha' }, {}, undefined)).toContain('• Check-in is at 2:00 PM')
  })
})

describe('postStayMsg', () => {
  it('thanks the guest and references the resort', () => {
    const msg = postStayMsg({ name: 'Asha' }, { name: 'Shoreline' })
    expect(msg).toContain('Hi Asha! Hope you enjoyed your stay at Shoreline 🏡')
    expect(msg).toContain('Google review')
  })
})
