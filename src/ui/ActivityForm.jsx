import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createActivity, getActivity, updateActivity } from "../api/activitiesApi"

export default function ActivityForm({ mode }) {
  const isEdit = mode === "edit"
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({ title: "", type: "", date: "", notes: "" })
  const [original, setOriginal] = useState(null) // keep original DTO (with tripId, etc.)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState(null)

  // Load existing activity if edit
  useEffect(() => {
    if (!isEdit) return
    let off = false
    getActivity(id)
      .then(a => {
        if (off) return
        setOriginal(a) // store full backend object
        setForm({
          title: a.title ?? "",
          type: a.type ?? "",
          date: a.date ?? "",
          notes: a.notes ?? "",
        })
        setLoading(false)
      })
      .catch(e => {
        if (!off) {
          setError(e)
          setLoading(false)
        }
      })
    return () => {
      off = true
    }
  }, [id, isEdit])

  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) {
      setError(new Error("Title is required"))
      return
    }
    if (!form.type?.trim()) {
      setError(new Error("Type is required (SIGHTSEEING | ADVENTURE | CULTURAL)"))
      return
    }

    try {
      if (isEdit) {
        await updateActivity(id, { form, original })
      } else {
        // TEMP: until Trip selector exists, we force tripId = 1
        await createActivity(form, { fallbackTripId: 1 })
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
        <input
          className="border rounded px-3 py-2 w-full"
          name="title"
          value={form.title}
          onChange={onChange}
        />
      </label>

      <label className="block">
        <span className="text-sm">Type *</span>
        <select
          className="border rounded px-3 py-2 w-full"
          name="type"
          value={form.type}
          onChange={onChange}
        >
          <option value="">Select type…</option>
          <option value="SIGHTSEEING">SIGHTSEEING</option>
          <option value="ADVENTURE">ADVENTURE</option>
          <option value="CULTURAL">CULTURAL</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Date *</span>
        <input
          type="date"
          className="border rounded px-3 py-2 w-full"
          name="date"
          value={form.date}
          onChange={onChange}
        />
      </label>

      <label className="block">
        <span className="text-sm">Notes</span>
        <textarea
          className="border rounded px-3 py-2 w-full"
          rows={4}
          name="notes"
          value={form.notes}
          onChange={onChange}
        />
      </label>

      {error && (
        <p className="text-red-600 text-sm">
          Error: {error.message || JSON.stringify(error)}
        </p>
      )}

      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded" type="submit">
          {isEdit ? "Save" : "Create"}
        </button>
        <button
          className="px-3 py-2 border rounded"
          type="button"
          onClick={() => history.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}