import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { listTrips, deleteTrip } from "../api/tripsApi"

export default function TripsList() {
  const [trips, setTrips] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let off = false
    listTrips()
      .then(data => {
        if (!off) setTrips(data)
      })
      .catch(err => {
        if (!off) setError(err)
      })
      .finally(() => {
        if (!off) setLoading(false)
      })
    return () => { off = true }
  }, [])

  async function onDelete(id) {
    if (!window.confirm("Delete this trip?")) return
    try {
      await deleteTrip(id)
      setTrips(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError(err)
    }
  }

  if (loading) return <p>Loading trips…</p>
  if (error) return <p className="text-red-600">Error: {error.message}</p>

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-semibold">All Trips</h2>

      {trips.length === 0 ? (
        <p>No trips yet.</p>
      ) : (
        <ul className="space-y-2">
          {trips.map(t => (
            <li key={t.id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm opacity-70">
                  {t.startDate} → {t.endDate} | {t.destination?.city}, {t.destination?.country}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={`/trips/${t.id}`} className="px-3 py-1 border rounded">View</Link>
                <button onClick={() => onDelete(t.id)} className="px-3 py-1 border rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}