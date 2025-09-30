import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getActivity, deleteActivity } from "../../api/activitiesApi"

export default function ActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [s, setS] = useState({ loading: true, error: null, data: null })

  useEffect(() => {
    let off = false
    setS(prev => ({ ...prev, loading: true, error: null }))
    getActivity(id)
      .then(d => !off && setS({ loading: false, error: null, data: d }))
      .catch(e => !off && setS({ loading: false, error: e, data: null }))
    return () => { off = true }
  }, [id])

  async function onDelete() {
    if (!confirm("Delete this Activity?")) return
    try {
      await deleteActivity(id)
      navigate("/activities")
    } catch (e) {
      alert(`Failed to delete: ${e.message}`)
    }
  }

  if (s.loading) return <p>Loading...</p>
  if (s.error)   return <p className="text-red-600">Error: {s.error.message}</p>
  if (!s.data)   return <p>Not Found</p>

  const a = s.data
  const title = a.title || a.activityName || `Activity #${id}`
  const type  = a.type  || a.activityType  || "—"
  const date  = a.date  || a.activityDate  || "—"
  const notes = a.notes || a.description   || "—"

  return (
    <section className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
        {/* Title */}
        <h2 className="text-2xl font-semibold">{title}</h2>

        {/* Meta info */}
        <dl className="space-y-2 text-gray-800">
          <div>
            <dt className="font-semibold">Trip:</dt>
            <dd>{a.tripName || `Trip #${a.tripId}`}</dd>
          </div>
          <div>
            <dt className="font-semibold">Type:</dt>
            <dd>{type}</dd>
          </div>
          <div>
            <dt className="font-semibold">Date:</dt>
            <dd>{date}</dd>
          </div>
          {notes && (
            <div>
              <dt className="font-semibold">Notes:</dt>
              <dd>{notes}</dd>
            </div>
          )}

          {/* Subtype fields */}
          {a.landmarkName && (
            <div>
              <dt className="font-semibold">Landmark:</dt>
              <dd>{a.landmarkName}</dd>
            </div>
          )}
          {a.location && (
            <div>
              <dt className="font-semibold">Location:</dt>
              <dd>{a.location}</dd>
            </div>
          )}
          {a.difficultyLevel && (
            <div>
              <dt className="font-semibold">Difficulty:</dt>
              <dd>{a.difficultyLevel}</dd>
            </div>
          )}
          {a.equipmentRequired && (
            <div>
              <dt className="font-semibold">Equipment:</dt>
              <dd>{a.equipmentRequired}</dd>
            </div>
          )}
          {a.eventName && (
            <div>
              <dt className="font-semibold">Event:</dt>
              <dd>{a.eventName}</dd>
            </div>
          )}
          {a.organizer && (
            <div>
              <dt className="font-semibold">Organizer:</dt>
              <dd>{a.organizer}</dd>
            </div>
          )}
        </dl>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Link
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            to={`/activities/${id}/edit`}
          >
            Edit
          </Link>
          <button
            className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
            onClick={onDelete}
          >
            Delete
          </button>
          <Link
            className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
            to="/activities"
          >
            Back
          </Link>
        </div>
      </div>
    </section>
  )
}