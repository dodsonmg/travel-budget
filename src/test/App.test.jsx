import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

vi.mock('../data', async () => {
  const actual = await vi.importActual('../data')
  return {
    ...actual,
    loadTrips: vi.fn(),
    loadExpenses: vi.fn(),
    saveTrip: vi.fn(),
    deleteTrip: vi.fn(),
    saveExpense: vi.fn(),
    deleteExpense: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
  }
})

import { supabase } from '../supabase'
import { loadTrips, loadExpenses, saveTrip, saveExpense } from '../data'
import App from '../App'

beforeEach(() => {
  vi.clearAllMocks()
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
  supabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
  loadTrips.mockResolvedValue([])
  loadExpenses.mockResolvedValue([])
  saveTrip.mockResolvedValue(undefined)
  saveExpense.mockResolvedValue(undefined)
})

describe('App trip templates', () => {
  it('seeds placeholder expenses when creating an international trip', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText(/No trips yet/i)
    await user.click(screen.getAllByText('+ New Trip')[0])
    await user.selectOptions(screen.getByLabelText('Trip Template'), 'international')
    await user.type(screen.getByPlaceholderText('e.g. Summer Vacation'), 'Paris 2026')
    await user.type(screen.getByPlaceholderText('e.g. Austin, TX'), 'Paris, France')
    await user.type(screen.getByLabelText('Start Date *'), '2026-07-01')
    await user.type(screen.getByLabelText('End Date *'), '2026-07-12')
    await user.click(screen.getByText('Save Trip'))

    await waitFor(() => expect(saveTrip).toHaveBeenCalledTimes(1))
    expect(saveTrip).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Paris 2026',
        destination: 'Paris, France',
        startDate: '2026-07-01',
        endDate: '2026-07-12',
        status: 'planning',
      }),
      'user-1'
    )

    await waitFor(() => expect(saveExpense).toHaveBeenCalledTimes(6))
    expect(saveExpense.mock.calls.map(([expense]) => expense.description)).toEqual([
      'International flight',
      'Hotel or stay',
      'Airport transfers and local transit',
      'Meals and drinks',
      'Tours and sightseeing',
      'Travel insurance and documents',
    ])
    expect(saveExpense.mock.calls.every(([expense]) => expense.budgeted === 0)).toBe(true)
  })
})
