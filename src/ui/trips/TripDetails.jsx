import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTrip } from '../../api/tripsApi'
import { listActivities } from '../../api/activitiesApi'

export default function TripDetail() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [acts, setActs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let off = false
    async function load() {
      setLoading(true); setError(null)
      try {
        const [t, list] = await Promise.all([
          getTrip(id),
          listActivities({ page: 1, pageSize: 9999 }) // client-side filter
        ])
        if (off) return
        setTrip(t)
        setActs((list.data || []).filter(a => String(a.tripId) === String(id)))
      } catch (e) {
        if (!off) setError(e)
      } finally {
        if (!off) setLoading(false)
      }
    }
    load()
    return () => { off = true }
  }, [id])

  if (loading) return <p>Loading trip…</p>
  if (error)   return <p className="text-red-600">Error: {error.message}</p>
  if (!trip)   return <p>Not found</p>

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      {/* Trip card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">{trip.name}</h2>
            <p className="text-sm text-gray-700 mt-1">
              {trip.startDate} – {trip.endDate}
              {trip.destination && (
                <> · {trip.destination.city}, {trip.destination.country}</>
              )}
            </p>
          </div>

          <Link
            to={`/activities/new?tripId=${trip.id}`}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap"
          >
            + Add Activity
          </Link>
        </div>
      </div>

      {/* Activities section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Activities</h3>

        {acts.length === 0 ? (
          <p className="text-gray-700">No activities for this trip yet.</p>
        ) : (
          <ul className="space-y-3">
            {acts.map(a => (
              <li key={a.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.title || `Activity #${a.id}`}</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {a.date} • {a.type}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 transition"
                    to={`/activities/${a.id}`}
                  >
                    View
                  </Link>
                  <Link
                    className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                    to={`/activities/${a.id}/edit`}
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Back */}
      <div className="pt-2">
        <Link
          className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
          to="/trips"
        >
          Back to trips
        </Link>
      </div>
    </section>
  )
}