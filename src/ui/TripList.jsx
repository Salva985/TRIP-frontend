// src/ui/TripsList.jsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { listTrips, deleteTrip } from "../api/tripsApi"
import TripForm from "./TripForm"

export default function TripsList() {
  const [trips, setTrips] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let off = false
    listTrips()
      .then(data => { if (!off) setTrips(Array.isArray(data) ? data : []) })
      .catch(err => { if (!off) setError(err) })
      .finally(() => { if (!off) setLoading(false) })
    return () => { off = true }
  }, [])

  async function onDelete(id) {
    const ok = window.confirm(
      "Are you sure you want to delete this trip? All activities in this trip will be lost permanently."
    )
    if (!ok) return
    try {
      setDeletingId(id)
      await deleteTrip(id)
      setTrips(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert(err?.message || "Failed to delete trip.")
    } finally {
      setDeletingId(null)
    }
  }

  function onTripCreated(t) {
    setTrips(prev => [...prev, t])
    setShowCreate(false)
  }

  if (loading) return <p>Loading trips…</p>
  if (error)   return <p className="text-red-600">Error: {error.message}</p>

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Trips</h2>
        <button className="px-3 py-2 border rounded hover:bg-gray-50"
                onClick={() => setShowCreate(v => !v)}>
          {showCreate ? "Close" : "New Trip +"}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border rounded p-4 shadow-sm">
          <TripForm onSuccess={onTripCreated} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      {trips.length === 0 ? (
        <p>No trips yet.</p>
      ) : (
        <ul className="space-y-4">
          {trips.map(t => (
            <li key={t.id}
                className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center hover:shadow-lg transition">
              <div>
                <p className="font-medium text-gray-800">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {t.startDate} - {t.endDate}
                  {t.destination && (t.destination.city || t.destination.country) ? (
                    <> · {t.destination.city || ""}{t.destination.city && t.destination.country ? ", " : ""}{t.destination.country || ""}</>
                  ) : null}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={`/trips/${t.id}`} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                  View
                </Link>
                <button
                  onClick={() => onDelete(t.id)}
                  disabled={deletingId === t.id}
                  className={`px-3 py-1 rounded text-white ${deletingId === t.id ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {deletingId === t.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}