import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrintInvoice } from './PrintInvoice'

const resort = { name: 'Shoreline', address: 'Beach Rd', phone: '+91 9999999999', email: 'stay@shoreline.in', taxRate: 5 }
const booking = {
  id: 'BK-001', status: 'Confirmed', source: 'Direct',
  checkIn: '2026-08-06', checkOut: '2026-08-08',
  nights: 2, adults: 2, children: 1, total: 2100,
  paymentStatus: 'Paid', paymentMethod: 'UPI', specialRequests: 'Early breakfast',
}
const guest = { name: 'Asha Nair', phone: '9999999999', email: 'asha@x.in' }
const room = { name: 'Sea View', roomId: 'R1' }

function renderInvoice() {
  const onClose = vi.fn()
  render(<PrintInvoice booking={booking} guest={guest} room={room} resort={resort} onClose={onClose} />)
  return onClose
}

beforeEach(() => {
  window.print = vi.fn()
})

describe('PrintInvoice', () => {
  it('renders header, guest, room, and stay details', () => {
    renderInvoice()
    expect(screen.getByRole('heading', { name: 'Shoreline', hidden: true })).toBeInTheDocument()
    expect(screen.getByText('Asha Nair')).toBeInTheDocument()
    expect(screen.getByText('Sea View')).toBeInTheDocument()
    expect(screen.getByText('BK-001')).toBeInTheDocument()
    expect(screen.getByText(/06\/08\/2026 at 2:00 PM/)).toBeInTheDocument()
    expect(screen.getByText(/08\/08\/2026 at 11:00 AM/)).toBeInTheDocument()
    expect(screen.getByText('2A, 1C')).toBeInTheDocument()
  })

  it('splits tax out of the total', () => {
    renderInvoice()
    expect(screen.getByText('Tax (5%)')).toBeInTheDocument()
    expect(screen.getByText('₹100')).toBeInTheDocument()
    expect(screen.getByText('₹2,000')).toBeInTheDocument()
    expect(screen.getByText('Total: ₹2,100')).toBeInTheDocument()
  })

  it('shows payment and special requests', () => {
    renderInvoice()
    expect(screen.getByText('Paid (UPI)')).toBeInTheDocument()
    expect(screen.getByText('Early breakfast')).toBeInTheDocument()
  })

  it('calls onClose on afterprint', () => {
    const onClose = renderInvoice()
    fireEvent(window, new Event('afterprint'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
