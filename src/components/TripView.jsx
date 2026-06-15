import { useState } from 'react'
import { CATEGORIES, fmt, tripTotals } from '../data'
import ExpenseForm from './ExpenseForm'

export default function TripView({ trip, expenses, onSaveExpense, onDeleteExpense, onEditTrip, onDeleteTrip }) {
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [expandedNotes, setExpandedNotes] = useState({})

  const totals = tripTotals(expenses)

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    items: expenses.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0)

  const toggleNote = (id) => setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{trip.destination}</h2>
          {trip.name && <p className="text-sm text-gray-500">{trip.name}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowExpenseForm(true)} className="btn-primary">+ Add Expense</button>
          <button onClick={() => onEditTrip(trip)} className="btn-secondary">Edit Trip</button>
          <button
            onClick={() => { if (confirm('Delete this trip and all its expenses?')) onDeleteTrip(trip.id) }}
            className="btn-danger"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Trip totals summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Budgeted" value={fmt(totals.budgeted)} color="text-gray-700" />
        <SummaryCard label="Paid" value={fmt(totals.paid)} color="text-green-700" />
        <SummaryCard label="Pending" value={fmt(totals.pending)} color="text-amber-700" />
        <SummaryCard label="Remaining" value={fmt(totals.remaining)} color={totals.remaining < 0 ? 'text-red-700' : 'text-blue-700'} />
      </div>

      {byCategory.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          No expenses yet. Click <strong>+ Add Expense</strong> to get started.
        </div>
      )}

      {byCategory.map(({ cat, items }) => {
        const catTotals = tripTotals(items)
        return (
          <div key={cat} className="mb-6">
            <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
              <h3 className="font-semibold text-gray-700">{cat}</h3>
              <span className="text-xs text-gray-400 hidden sm:inline">
                {fmt(catTotals.budgeted)} budgeted · {fmt(catTotals.paid)} paid · {fmt(catTotals.pending)} pending
              </span>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Description</th>
                    <th className="text-right px-4 py-2 font-medium">Budgeted</th>
                    <th className="text-right px-4 py-2 font-medium">Paid</th>
                    <th className="text-right px-4 py-2 font-medium">Pending</th>
                    <th className="text-right px-4 py-2 font-medium">Remaining</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((exp) => {
                    const rem = exp.fullyPaid ? 0 : Math.max(0, (Number(exp.budgeted) || 0) - (Number(exp.paid) || 0) - (Number(exp.pending) || 0))
                    return (
                      <>
                        <tr key={exp.id} className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span>{exp.description}</span>
                              {exp.fullyPaid && <span className="text-xs text-green-600 font-medium">paid in full</span>}
                              {exp.notes && (
                                <button
                                  onClick={() => toggleNote(exp.id)}
                                  className="text-xs text-blue-500 hover:underline"
                                >
                                  {expandedNotes[exp.id] ? 'hide note' : 'note'}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right text-gray-700">{fmt(exp.budgeted)}</td>
                          <td className="px-4 py-2 text-right text-green-700">{fmt(exp.paid)}</td>
                          <td className="px-4 py-2 text-right text-amber-700">{fmt(exp.pending)}</td>
                          <td className={`px-4 py-2 text-right font-medium ${rem < 0 ? 'text-red-600' : 'text-blue-700'}`}>{fmt(rem)}</td>
                          <td className="px-2 py-2 text-right whitespace-nowrap">
                            <button onClick={() => setEditingExpense(exp)} className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1">Edit</button>
                            <button
                              onClick={() => { if (confirm('Delete this expense?')) onDeleteExpense(exp.id) }}
                              className="text-xs text-red-400 hover:text-red-600 px-2 py-1"
                            >
                              Del
                            </button>
                          </td>
                        </tr>
                        {expandedNotes[exp.id] && (
                          <tr key={`${exp.id}-note`} className="bg-blue-50">
                            <td colSpan={6} className="px-4 py-2 text-xs text-blue-800 whitespace-pre-wrap">{exp.notes}</td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {showExpenseForm && (
        <ExpenseForm
          tripId={trip.id}
          onSave={onSaveExpense}
          onClose={() => setShowExpenseForm(false)}
        />
      )}
      {editingExpense && (
        <ExpenseForm
          expense={editingExpense}
          tripId={trip.id}
          onSave={onSaveExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
}
