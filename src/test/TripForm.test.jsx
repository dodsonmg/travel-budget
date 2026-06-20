import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TripForm from '../components/TripForm'

function renderForm(trip = null) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  render(<TripForm trip={trip} onSave={onSave} onClose={onClose} />)
  return { onSave, onClose }
}

describe('TripForm', () => {
  it('shows a template selector for new trips', () => {
    renderForm()
    expect(screen.getByLabelText('Trip Template')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Blank trip')).toBeInTheDocument()
  })

  it('does not show a template selector when editing a trip', () => {
    renderForm({ id: 'trip-1', destination: 'Tokyo', name: 'Spring trip', startDate: '2026-04-01', endDate: '2026-04-10', status: 'planning' })
    expect(screen.queryByLabelText('Trip Template')).not.toBeInTheDocument()
  })

  it('passes the selected template key to onSave for new trips', async () => {
    const user = userEvent.setup()
    const { onSave } = renderForm()

    await user.selectOptions(screen.getByLabelText('Trip Template'), 'domestic-flight')
    await user.type(screen.getByPlaceholderText('e.g. Summer Vacation'), 'Summer in Chicago')
    await user.type(screen.getByPlaceholderText('e.g. Austin, TX'), 'Chicago, IL')
    await user.type(screen.getByLabelText('Start Date *'), '2026-07-01')
    await user.type(screen.getByLabelText('End Date *'), '2026-07-05')
    await user.click(screen.getByText('Save Trip'))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave.mock.calls[0][1]).toBe('domestic-flight')
    expect(onSave.mock.calls[0][0].templateKey).toBe('domestic-flight')
  })
})
