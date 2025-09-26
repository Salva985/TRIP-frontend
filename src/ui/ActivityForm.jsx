import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createActivity, getActivity, updateActivity } from "../api/activitiesApi"

export default function ActivityForm({ mode }) {
  const isEdit = mode === "edit"
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "", type: "", date: "", notes: "",
    // subtype fields (conditionally used)
    landmarkName: "", location: "",
    difficultyLevel: "", equipmentRequired: "",
    eventName: "", organizer: "",
  })
  const [original, setOriginal] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    let off = false
    getActivity(id)
      .then(a => {
        if (off) return
        setOriginal(a)
        setForm(f => ({
          ...f,
          title: a.title ?? "",
          type:  a.type  ?? "",
          date:  a.date  ?? "",
          notes: a.notes ?? "",
          landmarkName:      a.landmarkName      ?? "",
          location:          a.location          ?? "",
          difficultyLevel:   a.difficultyLevel   ?? "",
          equipmentRequired: a.equipmentRequired ?? "",
          eventName:         a.eventName         ?? "",
          organizer:         a.organizer         ?? "",
        }))
        setLoading(false)
      })
      .catch(e => { if (!off) { setError(e); setLoading(false) } })
    return () => { off = true }
  }, [id, isEdit])

  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // When type changes, clear irrelevant subtype fields
  useEffect(() => {
    setForm(f => {
      if (f.type === "SIGHTSEEING")
        return { ...f, difficultyLevel: "", equipmentRequired: "", eventName: "", organizer: "" }
      if (f.type === "ADVENTURE")
        return { ...f, landmarkName: "", location: "", eventName: "", organizer: "" }
      if (f.type === "CULTURAL")
        return { ...f, landmarkName: "", location: "", difficultyLevel: "", equipmentRequired: "" }
      return f
    })
  }, [form.type])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) { setError(new Error("Title is required")); return }
    if (!form.type?.trim()) { setError(new Error("Type is required (SIGHTSEEING | ADVENTURE | CULTURAL)")); return }
    if (!form.date?.trim()) { setError(new Error("Date is required")); return }

    try {
      if (isEdit) {
        await updateActivity(id, { form, original })
      } else {
        const fallbackTripId = Number(import.meta.env.VITE_DEFAULT_TRIP_ID || 1)
        await createActivity(form, { fallbackTripId })
      }
      navigate("/")
    } catch (err) {
      setError(err)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <form className="space-y-3 max-w-lg" onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold">{isEdit ? "Edit Activity" : "New Activity"}</h2>

      <label className="block">
        <span className="text-sm">Title *</span>
        <input className="border rounded px-3 py-2 w-full" name="title" value={form.title} onChange={onChange}/>
      </label>

      <label className="block">
        <span className="text-sm">Type *</span>
        <select className="border rounded px-3 py-2 w-full" name="type" value={form.type} onChange={onChange}>
          <option value="">Select type…</option>
          <option value="SIGHTSEEING">SIGHTSEEING</option>
          <option value="ADVENTURE">ADVENTURE</option>
          <option value="CULTURAL">CULTURAL</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Date *</span>
        <input type="date" className="border rounded px-3 py-2 w-full" name="date" value={form.date} onChange={onChange}/>
      </label>

      <label className="block">
        <span className="text-sm">Notes</span>
        <textarea className="border rounded px-3 py-2 w-full" rows={4} name="notes" value={form.notes} onChange={onChange}/>
      </label>

      {/* Subtype blocks */}
      {form.type === "SIGHTSEEING" && (
        <>
          <label className="block">
            <span className="text-sm">Landmark name</span>
            <input className="border rounded px-3 py-2 w-full" name="landmarkName" value={form.landmarkName} onChange={onChange}/>
          </label>
          <label className="block">
            <span className="text-sm">Location</span>
            <input className="border rounded px-3 py-2 w-full" name="location" value={form.location} onChange={onChange}/>
          </label>
        </>
      )}

      {form.type === "ADVENTURE" && (
        <>
          <label className="block">
            <span className="text-sm">Difficulty level</span>
            <input className="border rounded px-3 py-2 w-full" name="difficultyLevel" value={form.difficultyLevel} onChange={onChange}/>
          </label>
          <label className="block">
            <span className="text-sm">Equipment required</span>
            <input className="border rounded px-3 py-2 w-full" name="equipmentRequired" value={form.equipmentRequired} onChange={onChange}/>
          </label>
        </>
      )}

      {form.type === "CULTURAL" && (
        <>
          <label className="block">
            <span className="text-sm">Event name</span>
            <input className="border rounded px-3 py-2 w-full" name="eventName" value={form.eventName} onChange={onChange}/>
          </label>
          <label className="block">
            <span className="text-sm">Organizer</span>
            <input className="border rounded px-3 py-2 w-full" name="organizer" value={form.organizer} onChange={onChange}/>
          </label>
        </>
      )}

      {error && <p className="text-red-600 text-sm">Error: {error.message || JSON.stringify(error)}</p>}

      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded" type="submit">{isEdit ? "Save" : "Create"}</button>
        <button className="px-3 py-2 border rounded" type="button" onClick={() => history.back()}>Cancel</button>
      </div>
    </form>
  )
}