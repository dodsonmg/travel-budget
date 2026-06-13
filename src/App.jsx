import { useState, useEffect, useRef } from 'react'
import { loadData, saveData, exportData, importData, tripLabel } from './data'
import Dashboard from './components/Dashboard'
import TripView from './components/TripView'
import TripForm from './components/TripForm'
import './index.css'

export default function App() {
  const [data, setData] = useState(() => loadData())
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showTripForm, setShowTripForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const importRef = useRef()

  useEffect(() => {
    saveData(data)
  }, [data])

  const trips = [...data.trips].sort((a, b) => {
    if (!a.startDate) return 1
    if (!b.startDate) return -1
    return a.startDate.localeCompare(b.startDate)
  })

  const saveTrip = (trip) => {
    setData((d) => {
      const exists = d.trips.find((t) => t.id === trip.id)
      return {
        ...d,
        trips: exists
          ? d.trips.map((t) => (t.id === trip.id ? trip : t))
          : [...d.trips, trip],
      }
    })
    setActiveTab(trip.id)
  }

  const deleteTrip = (tripId) => {
    setData((d) => ({
      trips: d.trips.filter((t) => t.id !== tripId),
      expenses: d.expenses.filter((e) => e.tripId !== tripId),
    }))
    setActiveTab('dashboard')
  }

  const saveExpense = (expense) => {
    setData((d) => {
      const exists = d.expenses.find((e) => e.id === expense.id)
      return {
        ...d,
        expenses: exists
          ? d.expenses.map((e) => (e.id === expense.id ? expense : e))
          : [...d.expenses, expense],
      }
    })
  }

  const deleteExpense = (expenseId) => {
    setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== expenseId) }))
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const imported = await importData(file)
      setData(imported)
      setActiveTab('dashboard')
    } catch {
      alert('Failed to import file. Make sure it is a valid travel-budget JSON export.')
    }
    e.target.value = ''
  }

  const activeTrip = trips.find((t) => t.id === activeTab)

  const tabBase = 'px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 whitespace-nowrap cursor-pointer'
  const tabActive = 'bg-white border-gray-200 text-gray-900'
  const tabInactive = 'bg-gray-100 border-transparent text-gray-500 hover:text-gray-700'

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">✈️ Travel Budget</h1>
        <div className="flex gap-2">
          <button onClick={() => exportData(data)} className="btn-secondary text-xs">Export</button>
          <button onClick={() => importRef.current.click()} className="btn-secondary text-xs">Import</button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button onClick={() => { setEditingTrip(null); setShowTripForm(true) }} className="btn-primary text-xs">+ New Trip</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`${tabBase} ${activeTab === 'dashboard' ? tabActive : tabInactive}`}
        >
          Dashboard
        </button>
        {trips.map((trip) => (
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
      <div className="bg-white border border-gray-200 rounded-b-lg mx-6 mb-6 min-h-96">
        {activeTab === 'dashboard' ? (
          <Dashboard trips={trips} expenses={data.expenses} />
        ) : activeTrip ? (
          <TripView
            trip={activeTrip}
            expenses={data.expenses.filter((e) => e.tripId === activeTrip.id)}
            onSaveExpense={saveExpense}
            onDeleteExpense={deleteExpense}
            onEditTrip={(t) => { setEditingTrip(t); setShowTripForm(true) }}
            onDeleteTrip={deleteTrip}
          />
        ) : (
          <div className="p-6 text-gray-400">Trip not found.</div>
        )}
      </div>

      {showTripForm && (
        <TripForm
          trip={editingTrip}
          onSave={saveTrip}
          onClose={() => { setShowTripForm(false); setEditingTrip(null) }}
        />
      )}
    </div>
  )
}
