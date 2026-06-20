import { describe, it, expect } from 'vitest'
import { fmt, tripLabel, tripTotals, TRIP_TEMPLATES, createTripTemplateExpenses } from '../data'

describe('fmt', () => {
  it('formats a number as USD currency', () => {
    expect(fmt(1234.5)).toBe('$1,234.50')
  })

  it('formats zero', () => {
    expect(fmt(0)).toBe('$0.00')
  })

  it('handles null/undefined gracefully', () => {
    expect(fmt(null)).toBe('$0.00')
    expect(fmt(undefined)).toBe('$0.00')
  })
})

describe('tripLabel', () => {
  it('returns destination with date range', () => {
    const trip = { destination: 'Paris', startDate: '2026-07-01', endDate: '2026-07-10' }
    expect(tripLabel(trip)).toBe('Paris · Jul 1–Jul 10')
  })

  it('returns just the destination when dates are missing', () => {
    expect(tripLabel({ destination: 'Rome' })).toBe('Rome')
  })
})

describe('tripTotals', () => {
  const base = { budgeted: 100, paid: 60, pending: 20, fullyPaid: false }

  it('sums budgeted, paid, and pending across expenses', () => {
    const expenses = [base, { ...base, budgeted: 200, paid: 50, pending: 0 }]
    const totals = tripTotals(expenses)
    expect(totals.budgeted).toBe(300)
    expect(totals.paid).toBe(110)
    expect(totals.pending).toBe(20)
  })

  it('calculates remaining as budgeted - paid - pending for open expenses', () => {
    const totals = tripTotals([base])
    expect(totals.remaining).toBe(20) // 100 - 60 - 20
  })

  it('excludes fully paid expenses from remaining', () => {
    const expenses = [
      { budgeted: 100, paid: 80, pending: 0, fullyPaid: true },
      { budgeted: 200, paid: 50, pending: 30, fullyPaid: false },
    ]
    const totals = tripTotals(expenses)
    expect(totals.remaining).toBe(120) // only open expense: 200 - 50 - 30
  })

  it('remaining is 0 when all expenses are fully paid', () => {
    const expenses = [
      { budgeted: 100, paid: 80, pending: 0, fullyPaid: true },
      { budgeted: 200, paid: 150, pending: 0, fullyPaid: true },
    ]
    expect(tripTotals(expenses).remaining).toBe(0)
  })

  it('remaining is floored at zero when an open expense is over budget', () => {
    const expense = { budgeted: 100, paid: 120, pending: 0, fullyPaid: false }
    expect(tripTotals([expense]).remaining).toBe(0)
  })

  it('handles an empty expense list', () => {
    expect(tripTotals([])).toEqual({ budgeted: 0, paid: 0, pending: 0, remaining: 0 })
  })

  it('treats missing numeric fields as zero', () => {
    const expense = { description: 'placeholder', fullyPaid: false }
    expect(tripTotals([expense])).toEqual({ budgeted: 0, paid: 0, pending: 0, remaining: 0 })
  })
})

describe('trip templates', () => {
  it('exposes the supported template choices', () => {
    expect(TRIP_TEMPLATES.map((template) => template.key)).toEqual([
      'blank',
      'international',
      'domestic-flight',
      'domestic-drive',
    ])
  })

  it('creates zero-budget placeholder expenses for the international template', () => {
    const expenses = createTripTemplateExpenses('international', 'trip-1')
    expect(expenses.map((expense) => expense.description)).toEqual([
      'International flight',
      'Hotel or stay',
      'Airport transfers and local transit',
      'Meals and drinks',
      'Tours and sightseeing',
      'Travel insurance and documents',
    ])
    expect(expenses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tripId: 'trip-1',
          budgeted: 0,
          paid: 0,
          pending: 0,
          fullyPaid: false,
          notes: '',
        }),
      ])
    )
  })

  it('returns no expenses for the blank template', () => {
    expect(createTripTemplateExpenses('blank', 'trip-1')).toEqual([])
  })
})
