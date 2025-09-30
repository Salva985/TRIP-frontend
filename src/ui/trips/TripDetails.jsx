import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
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
          listActivities({ page: 1, pageSize: 9999 }) // we’ll filter client-side
        ])
        if (off) return
        setTrip(t)
        setActs(list.data.filter(a => String(a.tripId) === String(id)))
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
  if (error) return <p className="text-red-600">Error: {error.message}</p>
  if (!trip) return <p>Not found</p>

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{trip.name}</h2>
          <p className="text-sm opacity-75">
            {trip.startDate} → {trip.endDate} · {trip.destination?.city}, {trip.destination?.country}
          </p>
        </div>
        {/* Link to create a new activity with trip preselected */}
        <Link
          to={`/activities/new?tripId=${trip.id}`}
          className="px-3 py-2 border rounded"
        >
          Add Activity
        </Link>
      </div>

      <h3 className="font-semibold">Activities</h3>
      {acts.length === 0 ? (
        <p>No activities for this trip yet.</p>
      ) : (
        <ul className="divide-y border rounded">
          {acts.map(a => (
            <li key={a.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{a.title || `Activity #${a.id}`}</p>
                <p className="text-sm opacity-75">{a.date} · {a.type}</p>
              </div>
              <div className="flex gap-2">
                <Link className="px-2 py-1 border rounded" to={`/activities/${a.id}`}>View</Link>
                <Link className="px-2 py-1 border rounded" to={`/activities/${a.id}/edit`}>Edit</Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <Link className="px-3 py-2 border rounded" to="/trips">Back to trips</Link>
      </div>
    </section>
  )
}