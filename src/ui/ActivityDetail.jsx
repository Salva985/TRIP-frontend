import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getActivity, deleteActivity } from "../api/activitiesApi"

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
      navigate("/")
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
    <article className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p><strong>Trip:</strong> {a.tripName || `Trip #${a.tripId}`}</p>
      <p><strong>Type:</strong> {type}</p>
      <p><strong>Date:</strong> {date}</p>
      <p><strong>Notes:</strong> {notes}</p>

      {/* Subtype (render only if present) */}
      {a.landmarkName && <p><strong>Landmark:</strong> {a.landmarkName}</p>}
      {a.location && <p><strong>Location:</strong> {a.location}</p>}

      {a.difficultyLevel && <p><strong>Difficulty:</strong> {a.difficultyLevel}</p>}
      {a.equipmentRequired && <p><strong>Equipment:</strong> {a.equipmentRequired}</p>}

      {a.eventName && <p><strong>Event:</strong> {a.eventName}</p>}
      {a.organizer && <p><strong>Organizer:</strong> {a.organizer}</p>}

      <div className="flex gap-2">
        <Link className="px-3 py-2 border rounded" to={`/activities/${id}/edit`}>Edit</Link>
        <button className="px-3 py-2 border rounded" onClick={onDelete}>Delete</button>
        <Link className="px-3 py-2 border rounded" to="/">Back</Link>
      </div>
    </article>
  )
}