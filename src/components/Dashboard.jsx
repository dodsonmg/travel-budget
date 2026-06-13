import { fmt, tripLabel, tripTotals } from '../data'

export default function Dashboard({ trips, expenses }) {
  const activeTrips = trips.filter((t) => t.status !== 'completed')
  const completedTrips = trips.filter((t) => t.status === 'completed')

  const rows = (list) =>
    list.map((trip) => {
      const exp = expenses.filter((e) => e.tripId === trip.id)
      const t = tripTotals(exp)
      return { trip, ...t }
    })

  const activeRows = rows(activeTrips)
  const completedRows = rows(completedTrips)

  const grandTotals = activeRows.reduce(
    (acc, r) => ({
      budgeted: acc.budgeted + r.budgeted,
      paid: acc.paid + r.paid,
      pending: acc.pending + r.pending,
      remaining: acc.remaining + r.remaining,
    }),
    { budgeted: 0, paid: 0, pending: 0, remaining: 0 }
  )

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">All Trips</h2>

      {trips.length === 0 && (
        <div className="text-center py-16 text-gray-400">No trips yet. Click <strong>+ New Trip</strong> to get started.</div>
      )}

      {activeRows.length > 0 && (
        <Section title="Active & Upcoming" rows={activeRows} showTotals totals={grandTotals} />
      )}

      {completedRows.length > 0 && (
        <Section title="Completed" rows={completedRows} muted />
      )}
    </div>
  )
}

function Section({ title, rows, showTotals, totals, muted }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Trip</th>
              <th className="text-left px-4 py-3 font-medium">Dates</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Budgeted</th>
              <th className="text-right px-4 py-3 font-medium">Paid</th>
              <th className="text-right px-4 py-3 font-medium">Pending</th>
              <th className="text-right px-4 py-3 font-medium">Remaining</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-100 ${muted ? 'opacity-60' : ''}`}>
            {rows.map(({ trip, budgeted, paid, pending, remaining }) => {
              const start = trip.startDate ? new Date(trip.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
              const end = trip.endDate ? new Date(trip.endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
              return (
                <tr key={trip.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {trip.destination}
                    {trip.name && <span className="text-gray-400 font-normal ml-1">({trip.name})</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{start} – {end}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={trip.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(budgeted)}</td>
                  <td className="px-4 py-3 text-right text-green-700">{fmt(paid)}</td>
                  <td className="px-4 py-3 text-right text-amber-700">{fmt(pending)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${remaining < 0 ? 'text-red-600' : 'text-blue-700'}`}>{fmt(remaining)}</td>
                </tr>
              )
            })}
          </tbody>
          {showTotals && (
            <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-gray-700">Total (active &amp; upcoming)</td>
                <td className="px-4 py-3 text-right text-gray-700">{fmt(totals.budgeted)}</td>
                <td className="px-4 py-3 text-right text-green-700">{fmt(totals.paid)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{fmt(totals.pending)}</td>
                <td className={`px-4 py-3 text-right ${totals.remaining < 0 ? 'text-red-600' : 'text-blue-700'}`}>{fmt(totals.remaining)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    planning: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] || ''}`}>
      {status}
    </span>
  )
}
