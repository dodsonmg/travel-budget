import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TripView from '../components/TripView'

const TRIP = { id: 'trip-1', destination: 'Tokyo', name: 'Spring trip', startDate: '2026-04-01', endDate: '2026-04-10' }

const EXPENSES = [
  { id: 'e1', tripId: 'trip-1', category: 'Transport', description: 'Flight', budgeted: 800, paid: 750, pending: 0, fullyPaid: true, notes: '' },
  { id: 'e2', tripId: 'trip-1', category: 'Accommodation', description: 'Hotel', budgeted: 600, paid: 200, pending: 200, fullyPaid: false, notes: 'Confirmation: ABC123' },
]

function renderView(expenses = EXPENSES, overrides = {}) {
  const props = {
    trip: TRIP,
    expenses,
    onSaveExpense: vi.fn(),
    onDeleteExpense: vi.fn(),
    onEditTrip: vi.fn(),
    onDeleteTrip: vi.fn(),
    ...overrides,
  }
  render(<TripView {...props} />)
  return props
}

describe('TripView', () => {
  it('renders the trip destination', () => {
    renderView()
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
  })

  it('shows expenses grouped by category', () => {
    renderView()
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Accommodation')).toBeInTheDocument()
    expect(screen.getByText('Flight')).toBeInTheDocument()
    expect(screen.getByText('Hotel')).toBeInTheDocument()
  })

  it('shows "paid in full" badge on fully paid expenses', () => {
    renderView()
    expect(screen.getByText('paid in full')).toBeInTheDocument()
  })

  it('does not show "paid in full" badge on open expenses', () => {
    renderView([EXPENSES[1]])
    expect(screen.queryByText('paid in full')).not.toBeInTheDocument()
  })

  it('shows $0.00 remaining for a fully paid expense', () => {
    renderView([EXPENSES[0]])
    const rows = screen.getAllByRole('row')
    const flightRow = rows.find((r) => within(r).queryByText('Flight'))
    const cells = within(flightRow).getAllByRole('cell')
    const remainingCell = cells[4]
    expect(remainingCell).toHaveTextContent('$0.00')
  })

  it('shows correct remaining for an open expense', () => {
    renderView([EXPENSES[1]])
    const rows = screen.getAllByRole('row')
    const hotelRow = rows.find((r) => within(r).queryByText('Hotel'))
    const cells = within(hotelRow).getAllByRole('cell')
    const remainingCell = cells[4]
    expect(remainingCell).toHaveTextContent('$200.00') // 600 - 200 - 200
  })

  it('shows the expense form when "+ Add Expense" is clicked', async () => {
    const user = userEvent.setup()
    renderView()
    await user.click(screen.getByText('+ Add Expense'))
    expect(screen.getByText('New Expense')).toBeInTheDocument()
  })

  it('shows note toggle when an expense has notes', () => {
    renderView()
    expect(screen.getByText('note')).toBeInTheDocument()
  })

  it('expands and collapses a note on click', async () => {
    const user = userEvent.setup()
    renderView()
    const noteBtn = screen.getByText('note')
    await user.click(noteBtn)
    expect(screen.getByText('Confirmation: ABC123')).toBeInTheDocument()
    await user.click(screen.getByText('hide note'))
    expect(screen.queryByText('Confirmation: ABC123')).not.toBeInTheDocument()
  })

  it('shows empty state when there are no expenses', () => {
    renderView([])
    expect(screen.getByText(/No expenses yet/)).toBeInTheDocument()
  })

  it('calls onDeleteExpense after confirming deletion', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('confirm', () => true)
    const { onDeleteExpense } = renderView()
    const delButtons = screen.getAllByText('Del')
    await user.click(delButtons[0])
    expect(onDeleteExpense).toHaveBeenCalledWith('e1')
    vi.unstubAllGlobals()
  })

  it('does not call onDeleteExpense when deletion is cancelled', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('confirm', () => false)
    const { onDeleteExpense } = renderView()
    await user.click(screen.getAllByText('Del')[0])
    expect(onDeleteExpense).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
