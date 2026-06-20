import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock is hoisted above imports, so the mock is in place before data.js loads
vi.mock('../supabase', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../supabase'
import { loadTrips, loadExpenses, saveTrip, deleteTrip, saveExpense, saveExpenses, deleteExpense } from '../data'

// ── Test fixtures ─────────────────────────────────────────────────────────────

// What Supabase returns (snake_case column names)
const DB_TRIP = {
  id: 'trip-1',
  user_id: 'user-1',
  destination: 'Tokyo',
  name: 'Spring trip',
  start_date: '2026-04-01',
  end_date: '2026-04-10',
  status: 'planning',
  created_at: '2026-06-01T00:00:00Z',
}

// What the app uses (camelCase)
const APP_TRIP = {
  id: 'trip-1',
  destination: 'Tokyo',
  name: 'Spring trip',
  startDate: '2026-04-01',
  endDate: '2026-04-10',
  status: 'planning',
}

const DB_EXPENSE = {
  id: 'exp-1',
  trip_id: 'trip-1',
  user_id: 'user-1',
  category: 'Transport',
  description: 'Flight',
  budgeted: 800,
  paid: 750,
  pending: 0,
  fully_paid: true,
  notes: 'Confirmation: ABC123',
  created_at: '2026-06-01T00:00:00Z',
}

const APP_EXPENSE = {
  id: 'exp-1',
  tripId: 'trip-1',
  category: 'Transport',
  description: 'Flight',
  budgeted: 800,
  paid: 750,
  pending: 0,
  fullyPaid: true,
  notes: 'Confirmation: ABC123',
}

// ── Mock factory ──────────────────────────────────────────────────────────────
// Returns an object that mimics Supabase's fluent query builder.
// Each method returns `this` so calls can be chained freely.
// Adding a `.then()` makes the object a "thenable" — JavaScript's `await`
// calls `.then()` on any object that has it, so the entire chain is awaitable
// without needing a real Promise.

function createQueryMock(resolvedValue) {
  const mock = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: (resolve) => resolve(resolvedValue),
  }
  return mock
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── loadTrips ─────────────────────────────────────────────────────────────────

describe('loadTrips', () => {
  it('fetches from the trips table and converts snake_case to camelCase', async () => {
    supabase.from.mockReturnValue(createQueryMock({ data: [DB_TRIP], error: null }))
    const trips = await loadTrips()
    expect(supabase.from).toHaveBeenCalledWith('trips')
    expect(trips).toEqual([APP_TRIP])
  })

  it('returns an empty array when there are no trips', async () => {
    supabase.from.mockReturnValue(createQueryMock({ data: [], error: null }))
    expect(await loadTrips()).toEqual([])
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(createQueryMock({ data: null, error: new Error('connection refused') }))
    await expect(loadTrips()).rejects.toThrow('connection refused')
  })
})

// ── loadExpenses ──────────────────────────────────────────────────────────────

describe('loadExpenses', () => {
  it('fetches from the expenses table and converts snake_case to camelCase', async () => {
    supabase.from.mockReturnValue(createQueryMock({ data: [DB_EXPENSE], error: null }))
    const expenses = await loadExpenses()
    expect(supabase.from).toHaveBeenCalledWith('expenses')
    expect(expenses).toEqual([APP_EXPENSE])
  })

  it('returns an empty array when there are no expenses', async () => {
    supabase.from.mockReturnValue(createQueryMock({ data: [], error: null }))
    expect(await loadExpenses()).toEqual([])
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(createQueryMock({ data: null, error: new Error('connection refused') }))
    await expect(loadExpenses()).rejects.toThrow('connection refused')
  })
})

// ── saveTrip ──────────────────────────────────────────────────────────────────

describe('saveTrip', () => {
  it('upserts a trip converted to snake_case DB format', async () => {
    const mock = createQueryMock({ error: null })
    supabase.from.mockReturnValue(mock)
    await saveTrip(APP_TRIP, 'user-1')
    expect(supabase.from).toHaveBeenCalledWith('trips')
    expect(mock.upsert).toHaveBeenCalledWith({
      id: 'trip-1',
      user_id: 'user-1',
      destination: 'Tokyo',
      name: 'Spring trip',
      start_date: '2026-04-01',
      end_date: '2026-04-10',
      status: 'planning',
    })
  })

  it('converts null/missing optional fields correctly', async () => {
    const mock = createQueryMock({ error: null })
    supabase.from.mockReturnValue(mock)
    await saveTrip({ id: 'trip-2', destination: 'Rome', status: 'planning' }, 'user-1')
    const upserted = mock.upsert.mock.calls[0][0]
    expect(upserted.name).toBeNull()
    expect(upserted.start_date).toBeNull()
    expect(upserted.end_date).toBeNull()
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(createQueryMock({ error: new Error('insert failed') }))
    await expect(saveTrip(APP_TRIP, 'user-1')).rejects.toThrow('insert failed')
  })
})

// ── deleteTrip ────────────────────────────────────────────────────────────────

describe('deleteTrip', () => {
  it('deletes from the trips table filtered by id', async () => {
    const mock = createQueryMock({ error: null })
    supabase.from.mockReturnValue(mock)
    await deleteTrip('trip-1')
    expect(supabase.from).toHaveBeenCalledWith('trips')
    expect(mock.delete).toHaveBeenCalled()
    expect(mock.eq).toHaveBeenCalledWith('id', 'trip-1')
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(createQueryMock({ error: new Error('delete failed') }))
    await expect(deleteTrip('trip-1')).rejects.toThrow('delete failed')
  })
})

// ── saveExpense ───────────────────────────────────────────────────────────────

describe('saveExpense', () => {
  it('upserts an expense converted to snake_case DB format', async () => {
    const mock = createQueryMock({ error: null })
    supabase.from.mockReturnValue(mock)
    await saveExpense(APP_EXPENSE, 'user-1')
    expect(supabase.from).toHaveBeenCalledWith('expenses')
    expect(mock.upsert).toHaveBeenCalledWith({
      id: 'exp-1',
      trip_id: 'trip-1',
      user_id: 'user-1',
      category: 'Transport',
      description: 'Flight',
      budgeted: 800,
      paid: 750,
      pending: 0,
      fully_paid: true,
      notes: 'Confirmation: ABC123',
    })
  })

  it('coerces string numeric values to numbers', async () => {
    const mock = createQueryMock({ error: null })
    supabase.from.mockReturnValue(mock)
    await saveExpense({ ...APP_EXPENSE, budgeted: '100', paid: '80', pending: '0' }, 'user-1')
    const upserted = mock.upsert.mock.calls[0][0]
    expect(upserted.budgeted).toBe(100)
    expect(upserted.paid).toBe(80)
    expect(upserted.pending).toBe(0)
  })

  it('converts missing notes to null', async () => {
    const mock = createQueryMock({ error: null })
    supabase.from.mockReturnValue(mock)
    await saveExpense({ ...APP_EXPENSE, notes: '' }, 'user-1')
    expect(mock.upsert.mock.calls[0][0].notes).toBeNull()
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(createQueryMock({ error: new Error('insert failed') }))
    await expect(saveExpense(APP_EXPENSE, 'user-1')).rejects.toThrow('insert failed')
  })
})

// ── saveExpenses ──────────────────────────────────────────────────────────────

describe('saveExpenses', () => {
  it('upserts all expenses in one converted batch', async () => {
    const mock = createQueryMock({ error: null })
    supabase.from.mockReturnValue(mock)

    await saveExpenses([
      APP_EXPENSE,
      { ...APP_EXPENSE, id: 'exp-2', description: 'Hotel', budgeted: '500' },
    ], 'user-1')

    expect(supabase.from).toHaveBeenCalledTimes(1)
    expect(supabase.from).toHaveBeenCalledWith('expenses')
    expect(mock.upsert).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'exp-1', trip_id: 'trip-1', user_id: 'user-1' }),
      expect.objectContaining({ id: 'exp-2', description: 'Hotel', budgeted: 500 }),
    ])
  })

  it('does not query Supabase for an empty batch', async () => {
    await saveExpenses([], 'user-1')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('throws when the batch upsert fails', async () => {
    supabase.from.mockReturnValue(createQueryMock({ error: new Error('batch failed') }))
    await expect(saveExpenses([APP_EXPENSE], 'user-1')).rejects.toThrow('batch failed')
  })
})

// ── deleteExpense ─────────────────────────────────────────────────────────────

describe('deleteExpense', () => {
  it('deletes from the expenses table filtered by id', async () => {
    const mock = createQueryMock({ error: null })
    supabase.from.mockReturnValue(mock)
    await deleteExpense('exp-1')
    expect(supabase.from).toHaveBeenCalledWith('expenses')
    expect(mock.delete).toHaveBeenCalled()
    expect(mock.eq).toHaveBeenCalledWith('id', 'exp-1')
  })

  it('throws when Supabase returns an error', async () => {
    supabase.from.mockReturnValue(createQueryMock({ error: new Error('delete failed') }))
    await expect(deleteExpense('exp-1')).rejects.toThrow('delete failed')
  })
})
