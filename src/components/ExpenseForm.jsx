import { useState } from 'react'
import Modal from './Modal'
import { CATEGORIES, newId } from '../data'

const empty = { category: CATEGORIES[0], description: '', budgeted: '', paid: '', pending: '', notes: '' }

export default function ExpenseForm({ expense, tripId, onSave, onClose }) {
  const [form, setForm] = useState(
    expense ? { ...expense } : { ...empty, id: newId(), tripId }
  )

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  return (
    <Modal title={expense ? 'Edit Expense' : 'New Expense'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select className="input" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Description *">
            <input className="input" value={form.description} onChange={set('description')} required placeholder="e.g. Flight to Austin" />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Budgeted ($)">
            <input type="number" min="0" step="0.01" className="input" value={form.budgeted} onChange={set('budgeted')} placeholder="0.00" />
          </Field>
          <Field label="Paid ($)">
            <input type="number" min="0" step="0.01" className="input" value={form.paid} onChange={set('paid')} placeholder="0.00" />
          </Field>
          <Field label="Pending ($)">
            <input type="number" min="0" step="0.01" className="input" value={form.pending} onChange={set('pending')} placeholder="0.00" />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            className="input resize-none"
            rows={3}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Confirmation number, vendor info, etc."
          />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Save Expense</button>
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
