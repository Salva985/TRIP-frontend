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
    const ok = window.confirm(
      "Are you sure you want to delete this trip? All activities in this trip will be lost permanently."
    );
    if (!ok) return;
  
    try {
      await deleteTrip(id);
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert(err?.message || "Failed to delete trip.");
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
        <ul className="space-y-4">
          {trips.map(t => (
            <li
              key={t.id}
              className="bg-gray-200 shadow-md rounded-lg p-4 flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <p className="font-medium text-gray-800">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {t.startDate} → {t.endDate} | {t.destination?.city}, {t.destination?.country}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/trips/${t.id}`}
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  View
                </Link>
                <button
                  onClick={() => onDelete(t.id)}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}