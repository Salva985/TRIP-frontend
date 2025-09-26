import { client } from './client.js'

// Ensure YYYY-MM-DD
function toYMD(v) {
    if (!v) return undefined
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    const d = new Date(v)
    if (isNaN(d)) return undefined
    return d.toISOString().slice(0, 10)
  }
  
  /**
   * Build ActivityRequestDTO from form + original DTO (for edit).
   * Only includes fields your Spring DTO accepts.
   */
  function toActivityRequestDTO({ form, original, fallbackTripId }) {
    const dto = {
      tripId: original?.tripId ?? fallbackTripId,          // MUST be present
      date:   toYMD(form?.date ?? original?.date),         // LocalDate format
      title:  form?.title ?? original?.title,
      notes:  form?.notes ?? original?.notes ?? undefined,
      type:   (form?.type ?? original?.type),              // enum string
      // Keep subtype fields if backend sent them (so we don't drop them)
      landmarkName:      original?.landmarkName,
      location:          original?.location,
      difficultyLevel:   original?.difficultyLevel,
      equipmentRequired: original?.equipmentRequired,
      eventName:         original?.eventName,
      organizer:         original?.organizer,
    }
  
    // Remove undefined/null keys
    return Object.fromEntries(Object.entries(dto).filter(([,v]) => v !== undefined && v !== null))
  }

export async function listActivities({ search = '', page = 1, pageSize = 10 } = {}) {
    const all = await client('/api/activities')
  
    const filtered = search
      ? all.filter(a => {
          const title = (a.title || a.activityName || '').toLowerCase()
          const type  = (a.type  || a.activityType  || '').toLowerCase()
          const q = search.toLowerCase()
          return title.includes(q) || type.includes(q)
        })
      : all
  
    const start = (page - 1) * pageSize
    const data  = filtered.slice(start, start + pageSize)
    const meta  = { page, pageSize, total: filtered.length }
    return { data, meta }
  }

  export const getActivity = (id) =>
    client(`/api/activities/${encodeURIComponent(id)}`)
  
  export const createActivity = (form, { fallbackTripId = 1 } = {}) => {
    const body = toActivityRequestDTO({ form, original: null, fallbackTripId })
    return client('/api/activities', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
  
  export const updateActivity = (id, { form, original }) => {
    const body = toActivityRequestDTO({ form, original })
    return client(`/api/activities/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }
  
  export const deleteActivity = (id) =>
    client(`/api/activities/${encodeURIComponent(id)}`, { method: 'DELETE' })

// ---------- Health ----------
export async function checkHealth() {
    const path = import.meta.env.VITE_HEALTH_PATH || '/api/health'
    return client(path)
  }