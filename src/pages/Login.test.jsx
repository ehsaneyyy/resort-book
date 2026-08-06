import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Login } from './Login'

const hooks = vi.hoisted(() => ({
  mutate: vi.fn((_payload, callbacks) => callbacks?.onSuccess?.()),
  toast: vi.fn(),
}))

vi.mock('../api/hooks', () => ({
  useLogin: () => ({ mutate: hooks.mutate, isPending: false }),
}))

vi.mock('../components/useToast', () => ({
  useToast: () => hooks.toast,
}))

describe('Login', () => {
  beforeEach(() => {
    hooks.mutate.mockClear()
    hooks.toast.mockClear()
  })

  it('calls login with email and password and triggers onLoggedIn', () => {
    const onLoggedIn = vi.fn()
    render(<Login onLoggedIn={onLoggedIn} />)
    fireEvent.change(screen.getByPlaceholderText('you@yourresort.com'), { target: { value: 'admin@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(hooks.mutate).toHaveBeenCalledWith({ email: 'admin@test.com', password: 'password123' }, expect.any(Object))
    expect(onLoggedIn).toHaveBeenCalled()
    expect(hooks.toast).toHaveBeenCalledWith('Welcome back', 'success')
  })

  it('shows error when fields are empty', () => {
    render(<Login />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByText('Enter your email and password')).toBeInTheDocument()
    expect(hooks.mutate).not.toHaveBeenCalled()
  })
})
