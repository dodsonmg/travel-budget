import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Auth from '../components/Auth'
import { supabase } from '../supabase'

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
    },
  },
}))

describe('Auth', () => {
  beforeEach(() => {
    supabase.auth.signInWithOtp.mockReset()
    supabase.auth.signInWithOtp.mockResolvedValue({ error: null })
  })

  it('returns the magic link to the origin where sign-in started', async () => {
    const user = userEvent.setup()
    render(<Auth />)

    await user.type(screen.getByRole('textbox'), 'traveler@example.com')
    await user.click(screen.getByRole('button', { name: 'Send magic link' }))

    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'traveler@example.com',
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin,
      },
    })
    expect(screen.getByText(/Check your email/)).toBeInTheDocument()
  })
})
