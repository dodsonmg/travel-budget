import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpenseForm from '../components/ExpenseForm'

const TRIP_ID = 'trip-1'

function renderForm(expense = null) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  render(<ExpenseForm expense={expense} tripId={TRIP_ID} onSave={onSave} onClose={onClose} />)
  return { onSave, onClose }
}

describe('ExpenseForm', () => {
  it('renders "New Expense" title when no expense is provided', () => {
    renderForm()
    expect(screen.getByText('New Expense')).toBeInTheDocument()
  })

  it('renders "Edit Expense" title when editing an existing expense', () => {
    renderForm({ id: 'e1', tripId: TRIP_ID, category: 'Transport', description: 'Flight', budgeted: 300, paid: 300, pending: 0, fullyPaid: true, notes: '' })
    expect(screen.getByText('Edit Expense')).toBeInTheDocument()
  })

  it('pre-populates fields when editing an existing expense', () => {
    renderForm({ id: 'e1', tripId: TRIP_ID, category: 'Food & Dining', description: 'Dinner', budgeted: 80, paid: 80, pending: 0, fullyPaid: true, notes: 'great restaurant' })
    expect(screen.getByDisplayValue('Dinner')).toBeInTheDocument()
    // budgeted and paid are both 80 — two inputs share this value
    expect(screen.getAllByDisplayValue('80')).toHaveLength(2)
    expect(screen.getByDisplayValue('great restaurant')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls onSave with form data on submit', async () => {
    const user = userEvent.setup()
    const { onSave } = renderForm()

    await user.type(screen.getByPlaceholderText('e.g. Flight to Austin'), 'Train tickets')
    // three number inputs share placeholder "0.00"; index 0 is Budgeted
    await user.type(screen.getAllByPlaceholderText('0.00')[0], '50')

    await user.click(screen.getByText('Save Expense'))

    expect(onSave).toHaveBeenCalledOnce()
    const saved = onSave.mock.calls[0][0]
    expect(saved.description).toBe('Train tickets')
    expect(saved.tripId).toBe(TRIP_ID)
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const { onClose } = renderForm()
    await user.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('toggles the fullyPaid checkbox', async () => {
    const user = userEvent.setup()
    renderForm()
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('includes fullyPaid: true in saved data when checkbox is checked', async () => {
    const user = userEvent.setup()
    const { onSave } = renderForm()

    await user.type(screen.getByPlaceholderText('e.g. Flight to Austin'), 'Hotel')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByText('Save Expense'))

    expect(onSave.mock.calls[0][0].fullyPaid).toBe(true)
  })

  it('requires a description before submitting', async () => {
    const user = userEvent.setup()
    const { onSave } = renderForm()
    await user.click(screen.getByText('Save Expense'))
    expect(onSave).not.toHaveBeenCalled()
  })
})
