import { supabase } from './supabase'

export const CATEGORIES = [
  'Transport',
  'Accommodation',
  'Food & Dining',
  'Pet Sitting',
  'Entertainment',
  'Misc',
]

export const TRIP_STATUSES = ['planning', 'active', 'completed']

// ── DB helpers ────────────────────────────────────────────────────────────────
// Supabase uses snake_case columns; these converters keep the rest of the app
// using camelCase without change.

function tripFromDb(row) {
  return {
    id: row.id,
    destination: row.destination,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
  }
}

function tripToDb(trip, userId) {
  return {
    id: trip.id,
    user_id: userId,
    destination: trip.destination,
    name: trip.name || null,
    start_date: trip.startDate || null,
    end_date: trip.endDate || null,
    status: trip.status || 'planning',
  }
}

function expenseFromDb(row) {
  return {
    id: row.id,
    tripId: row.trip_id,
    category: row.category,
    description: row.description,
    budgeted: row.budgeted,
    paid: row.paid,
    pending: row.pending,
    fullyPaid: row.fully_paid,
    notes: row.notes,
  }
}

function expenseToDb(expense, userId) {
  return {
    id: expense.id,
    trip_id: expense.tripId,
    user_id: userId,
    category: expense.category,
    description: expense.description,
    budgeted: Number(expense.budgeted) || 0,
    paid: Number(expense.paid) || 0,
    pending: Number(expense.pending) || 0,
    fully_paid: expense.fullyPaid || false,
    notes: expense.notes || null,
  }
}

// ── Data loading ──────────────────────────────────────────────────────────────

export async function loadTrips() {
  const { data, error } = await supabase.from('trips').select('*').order('start_date')
  if (error) throw error
  return data.map(tripFromDb)
}

export async function loadExpenses() {
  const { data, error } = await supabase.from('expenses').select('*')
  if (error) throw error
  return data.map(expenseFromDb)
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function saveTrip(trip, userId) {
  const { error } = await supabase.from('trips').upsert(tripToDb(trip, userId))
  if (error) throw error
}

export async function deleteTrip(tripId) {
  const { error } = await supabase.from('trips').delete().eq('id', tripId)
  if (error) throw error
}

export async function saveExpense(expense, userId) {
  const { error } = await supabase.from('expenses').upsert(expenseToDb(expense, userId))
  if (error) throw error
}

export async function deleteExpense(expenseId) {
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
  if (error) throw error
}

// ── Export / import ───────────────────────────────────────────────────────────

export function exportData(trips, expenses) {
  const blob = new Blob([JSON.stringify({ trips, expenses }, null, 2)], { type: 'application/json' })
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

// ── Utility ───────────────────────────────────────────────────────────────────

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
