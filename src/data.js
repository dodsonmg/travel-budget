export const CATEGORIES = [
  'Transport',
  'Accommodation',
  'Food & Dining',
  'Pet Sitting',
  'Entertainment',
  'Misc',
]

export const TRIP_STATUSES = ['planning', 'active', 'completed']

const STORAGE_KEY = 'travel-budget-data'

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { trips: [], expenses: [] }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'travel-budget.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.readAsText(file)
  })
}

export function fmt(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
}

export function tripLabel(trip) {
  const start = trip.startDate ? new Date(trip.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
  const end = trip.endDate ? new Date(trip.endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
  const dates = start && end ? ` · ${start}–${end}` : ''
  return `${trip.destination}${dates}`
}

export function tripTotals(expenses) {
  const budgeted = expenses.reduce((s, e) => s + (Number(e.budgeted) || 0), 0)
  const paid = expenses.reduce((s, e) => s + (Number(e.paid) || 0), 0)
  const pending = expenses.reduce((s, e) => s + (Number(e.pending) || 0), 0)
  const remaining = expenses.reduce((s, e) => {
    if (e.fullyPaid) return s
    return s + Math.max(0, (Number(e.budgeted) || 0) - (Number(e.paid) || 0) - (Number(e.pending) || 0))
  }, 0)
  return { budgeted, paid, pending, remaining }
}

export function newId() {
  return crypto.randomUUID()
}
