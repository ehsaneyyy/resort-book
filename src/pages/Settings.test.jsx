import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Settings } from './Settings'

const hooks = vi.hoisted(() => {
  const resort = { name: 'My Resort', currency: '₹', phone: '', email: '', address: '', taxRate: 5, whatsappPhone: '' }
  return {
    resort,
    mutate: vi.fn((_payload, callbacks) => callbacks?.onSuccess?.()),
    toast: vi.fn(),
  }
})

vi.mock('../api/hooks', () => ({
  useResort: () => ({ data: hooks.resort, isLoading: false }),
  useUpdateResort: () => ({ mutate: hooks.mutate, isPending: false }),
  useRooms: () => ({ data: [], isLoading: false }),
  useGuests: () => ({ data: [], isLoading: false }),
  useBookings: () => ({ data: [], isLoading: false }),
  useSeasonalRules: () => ({ data: [], isLoading: false }),
  useStats: () => ({ data: { totalRooms: 0, totalBookings: 0, totalGuests: 0 } }),
  useChangePassword: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('../components/useToast', () => ({
  useToast: () => hooks.toast,
}))

describe('Settings', () => {
  it('renders all five sections', () => {
    render(<Settings />)
    expect(screen.getByText('Property Profile')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Data & Backup')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.getByText('API + Neon Postgres')).toBeInTheDocument()
  })

  it('hides the save button until a field changes', () => {
    render(<Settings />)
    expect(screen.queryByRole('button', { name: 'Save Settings' })).toBeNull()
    fireEvent.change(screen.getByDisplayValue('My Resort'), { target: { value: 'Shoreline' } })
    expect(screen.getByRole('button', { name: 'Save Settings' })).toBeInTheDocument()
  })

  it('saves the resort and shows confirmation', async () => {
    render(<Settings />)
    fireEvent.change(screen.getByDisplayValue('My Resort'), { target: { value: 'Shoreline' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }))
    expect(hooks.mutate).toHaveBeenCalledTimes(1)
    expect(hooks.mutate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Shoreline', taxRate: 5 }), expect.any(Object))
    expect(hooks.toast).toHaveBeenCalledWith('Settings saved', 'success')
    await screen.findByText('Saved')
  })

  it('exposes the export button when data is ready', () => {
    render(<Settings />)
    expect(screen.getByRole('button', { name: 'Export Backup' })).toBeEnabled()
  })
})
