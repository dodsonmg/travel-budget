import { useState } from 'react'
import Modal from './Modal'
import { TRIP_STATUSES, TRIP_TEMPLATES, newId } from '../data'

const empty = {
  name: '',
  destination: '',
  startDate: '',
  endDate: '',
  status: 'planning',
  templateKey: 'blank',
}

export default function TripForm({ trip, onSave, onClose }) {
  const [form, setForm] = useState(trip ? { ...trip } : { ...empty, id: newId() })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const handleClose = () => {
    if (!saving) onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave(form, form.templateKey || 'blank')
      setSaving(false)
      onClose()
    } catch (saveError) {
      setSaving(false)
      setError(saveError?.message || 'Could not save this trip. Please try again.')
    }
  }

  return (
    <Modal title={trip ? 'Edit Trip' : 'New Trip'} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={saving}>
        {!trip && (
          <Field label="Trip Template" htmlFor="trip-template">
            <select id="trip-template" className="input" value={form.templateKey} onChange={set('templateKey')}>
              {TRIP_TEMPLATES.map((template) => (
                <option key={template.key} value={template.key}>
                  {template.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Templates add zero-budget placeholder expenses after the trip is created.
            </p>
          </Field>
        )}
        <Field label="Trip Name (optional)" htmlFor="trip-name">
          <input id="trip-name" className="input" value={form.name} onChange={set('name')} placeholder="e.g. Summer Vacation" />
        </Field>
        <Field label="Destination *" htmlFor="trip-destination">
          <input id="trip-destination" className="input" value={form.destination} onChange={set('destination')} required placeholder="e.g. Austin, TX" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date *" htmlFor="trip-start-date">
            <input id="trip-start-date" type="date" className="input" value={form.startDate} onChange={set('startDate')} required />
          </Field>
          <Field label="End Date *" htmlFor="trip-end-date">
            <input id="trip-end-date" type="date" className="input" value={form.endDate} onChange={set('endDate')} required />
          </Field>
        </div>
        <Field label="Status" htmlFor="trip-status">
          <select id="trip-status" className="input" value={form.status} onChange={set('status')}>
            {TRIP_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </Field>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} disabled={saving} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Trip'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
