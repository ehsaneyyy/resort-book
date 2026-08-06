import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChangePasswordForm } from './ChangePasswordForm'

const hooks = vi.hoisted(() => ({
  mutate: vi.fn((_payload, callbacks) => callbacks?.onSuccess?.()),
  toast: vi.fn(),
}))

vi.mock('../api/hooks', () => ({
  useChangePassword: () => ({ mutate: hooks.mutate, isPending: false }),
}))

vi.mock('./useToast', () => ({
  useToast: () => hooks.toast,
}))

describe('ChangePasswordForm', () => {
  it('rejects passwords shorter than 8 characters', () => {
    render(<ChangePasswordForm />)
    fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'current-password' } })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'short' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }))
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    expect(hooks.mutate).not.toHaveBeenCalled()
  })

  it('rejects mismatched passwords', () => {
    render(<ChangePasswordForm />)
    fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'current-password' } })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'new-password-123' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: 'different-456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }))
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    expect(hooks.mutate).not.toHaveBeenCalled()
  })

  it('submits credentials and calls onSuccess', () => {
    const onSuccess = vi.fn()
    render(<ChangePasswordForm onSuccess={onSuccess} />)
    fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'current-password' } })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'new-password-123' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: 'new-password-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }))
    expect(hooks.mutate).toHaveBeenCalledTimes(1)
    expect(hooks.mutate).toHaveBeenCalledWith(
      { currentPassword: 'current-password', newPassword: 'new-password-123' },
      expect.any(Object)
    )
    expect(onSuccess).toHaveBeenCalled()
    expect(hooks.toast).toHaveBeenCalledWith('Password updated', 'success')
  })
})
