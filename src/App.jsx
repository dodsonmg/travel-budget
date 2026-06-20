import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import {
  loadTrips, loadExpenses,
  saveTrip, deleteTrip,
  saveExpense, saveExpenses, deleteExpense,
  exportData, importData,
  createTripTemplateExpenses,
  tripLabel,
} from './data'
import Dashboard from './components/Dashboard'
import TripView from './components/TripView'
import TripForm from './components/TripForm'
import Auth from './components/Auth'
import './index.css'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [trips, setTrips] = useState([])
  const [expenses, setExpenses] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showTripForm, setShowTripForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const importRef = useRef()

  // ── Auth ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Data loading ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session) return
    loadTrips().then(setTrips)
    loadExpenses().then(setExpenses)
  }, [session])

  // ── Trip handlers ───────────────────────────────────────────────────────────

  const handleSaveTrip = async (trip, templateKey = 'blank') => {
    const tripData = { ...trip }
    delete tripData.templateKey
    const isNewTrip = !trips.some((t) => t.id === tripData.id)
    await saveTrip(tripData, session.user.id)
    let templateExpenses = []
    if (isNewTrip && templateKey !== 'blank') {
      templateExpenses = createTripTemplateExpenses(templateKey, tripData.id)
      try {
        await saveExpenses(templateExpenses, session.user.id)
      } catch (error) {
        try {
          await deleteTrip(tripData.id)
        } catch {
          throw new Error('Trip templates could not be created, and cleanup failed. Refresh before trying again.')
        }
        throw error
      }
    }
    setTrips((prev) => {
      const exists = prev.find((t) => t.id === tripData.id)
      return exists ? prev.map((t) => (t.id === tripData.id ? tripData : t)) : [...prev, tripData]
    })
    if (templateExpenses.length > 0) {
      setExpenses((prev) => [...prev, ...templateExpenses])
    }
    setActiveTab(tripData.id)
  }

  const handleDeleteTrip = async (tripId) => {
    await deleteTrip(tripId)
    setTrips((prev) => prev.filter((t) => t.id !== tripId))
    setExpenses((prev) => prev.filter((e) => e.tripId !== tripId))
    setActiveTab('dashboard')
  }

  // ── Expense handlers ────────────────────────────────────────────────────────

  const handleSaveExpense = async (expense) => {
    await saveExpense(expense, session.user.id)
    setExpenses((prev) => {
      const exists = prev.find((e) => e.id === expense.id)
      return exists ? prev.map((e) => (e.id === expense.id ? expense : e)) : [...prev, expense]
    })
  }

  const handleDeleteExpense = async (expenseId) => {
    await deleteExpense(expenseId)
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId))
  }

  // ── Import / export ─────────────────────────────────────────────────────────

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const imported = await importData(file)
      for (const trip of imported.trips) await saveTrip(trip, session.user.id)
      for (const expense of imported.expenses) await saveExpense(expense, session.user.id)
      const [newTrips, newExpenses] = await Promise.all([loadTrips(), loadExpenses()])
      setTrips(newTrips)
      setExpenses(newExpenses)
      setActiveTab('dashboard')
    } catch {
      alert('Failed to import file. Make sure it is a valid travel-budget JSON export.')
    }
    e.target.value = ''
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (session === undefined) return null // initial auth check in flight

  if (!session) return <Auth />

  const sortedTrips = [...trips].sort((a, b) => {
    if (!a.startDate) return 1
    if (!b.startDate) return -1
    return a.startDate.localeCompare(b.startDate)
  })

  const activeTrip = sortedTrips.find((t) => t.id === activeTab)

  const tabBase = 'px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 whitespace-nowrap cursor-pointer'
  const tabActive = 'bg-white border-gray-200 text-gray-900'
  const tabInactive = 'bg-gray-100 border-transparent text-gray-500 hover:text-gray-700'

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">✈️ Travel Budget</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => exportData(sortedTrips, expenses)} className="btn-secondary text-xs">Export</button>
          <button onClick={() => importRef.current.click()} className="btn-secondary text-xs">Import</button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button onClick={() => { setEditingTrip(null); setShowTripForm(true) }} className="btn-primary text-xs">+ New Trip</button>
          <button onClick={() => supabase.auth.signOut()} className="btn-secondary text-xs">Sign out</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 pt-4 flex gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`${tabBase} ${activeTab === 'dashboard' ? tabActive : tabInactive}`}
        >
          Dashboard
        </button>
        {sortedTrips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => setActiveTab(trip.id)}
            className={`${tabBase} ${activeTab === trip.id ? tabActive : tabInactive}`}
          >
            {tripLabel(trip)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-b-lg mx-4 sm:mx-6 mb-6 min-h-96">
        {activeTab === 'dashboard' ? (
          <Dashboard trips={sortedTrips} expenses={expenses} />
        ) : activeTrip ? (
          <TripView
            trip={activeTrip}
            expenses={expenses.filter((e) => e.tripId === activeTrip.id)}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
            onEditTrip={(t) => { setEditingTrip(t); setShowTripForm(true) }}
            onDeleteTrip={handleDeleteTrip}
          />
        ) : (
          <div className="p-6 text-gray-400">Trip not found.</div>
        )}
      </div>

      {showTripForm && (
        <TripForm
          trip={editingTrip}
          onSave={handleSaveTrip}
          onClose={() => { setShowTripForm(false); setEditingTrip(null) }}
        />
      )}
    </div>
  )
}
