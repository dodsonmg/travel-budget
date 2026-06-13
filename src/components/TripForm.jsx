import { useState } from 'react'
import Modal from './Modal'
import { TRIP_STATUSES, newId } from '../data'

const empty = { name: '', destination: '', startDate: '', endDate: '', status: 'planning' }

export default function TripForm({ trip, onSave, onClose }) {
  const [form, setForm] = useState(trip ? { ...trip } : { ...empty, id: newId() })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  return (
    <Modal title={trip ? 'Edit Trip' : 'New Trip'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Trip Name (optional)">
          <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Summer Vacation" />
        </Field>
        <Field label="Destination *">
          <input className="input" value={form.destination} onChange={set('destination')} required placeholder="e.g. Austin, TX" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date *">
            <input type="date" className="input" value={form.startDate} onChange={set('startDate')} required />
          </Field>
          <Field label="End Date *">
            <input type="date" className="input" value={form.endDate} onChange={set('endDate')} required />
          </Field>
        </div>
        <Field label="Status">
          <select className="input" value={form.status} onChange={set('status')}>
            {TRIP_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Save Trip</button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
