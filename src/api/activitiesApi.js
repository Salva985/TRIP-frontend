import { client } from './client.js'

function toYMD(v) {
    if (!v) return undefined;
    // If already YYYY-MM-DD, keep it
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = new Date(v);
    if (isNaN(d)) return undefined;
    return d.toISOString().slice(0, 10);
  }
  
  function toActivityRequestDTO({ form = {}, original = null, fallbackTripId = null }) {
    const nz = v => (v === "" ? null : v);
  
    // pick tripId from form → original → fallback, then coerce to number
    const tripIdRaw =
      form?.tripId ?? original?.tripId ?? fallbackTripId ?? null;
    const tripId =
      tripIdRaw !== null && tripIdRaw !== undefined && tripIdRaw !== ""
        ? Number(tripIdRaw)
        : null;
  
    const from = (k) => form?.[k] ?? original?.[k];
  
    const dto = {
      tripId,                                 // REQUIRED by backend
      date:  toYMD(from('date')),             // REQUIRED (YYYY-MM-DD)
      title: from('title'),                   // REQUIRED
      type:  from('type'),                    // REQUIRED
      notes: nz(from('notes')),               // optional
  
      // subtype (optional)
      landmarkName:      nz(from('landmarkName')),
      location:          nz(from('location')),
      difficultyLevel:   nz(from('difficultyLevel')),
      equipmentRequired: nz(from('equipmentRequired')),
      eventName:         nz(from('eventName')),
      organizer:         nz(from('organizer')),
    };
  
    // drop only undefined (keep nulls so Spring sees "missing" vs "")
    return Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined)
    );
  }

/* function toYMD(v) {
    if (!v) return undefined
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    const d = new Date(v)
    if (isNaN(d)) return undefined
    return d.toISOString().slice(0, 10)
  } */
  
/*   function toActivityRequestDTO({ form = {}, original = null, fallbackTripId }) {
    const dto = {
      tripId: original?.tripId ?? fallbackTripId,
      date:   toYMD(form.date ?? original?.date),
      title:  form.title ?? original?.title,
      notes:  form.notes ?? original?.notes,
      type:   form.type  ?? original?.type,
  
      // subtype fields – prefer form values, then original
      landmarkName:      form.landmarkName      ?? original?.landmarkName,
      location:          form.location          ?? original?.location,
      difficultyLevel:   form.difficultyLevel   ?? original?.difficultyLevel,
      equipmentRequired: form.equipmentRequired ?? original?.equipmentRequired,
      eventName:         form.eventName         ?? original?.eventName,
      organizer:         form.organizer         ?? original?.organizer,
    }
  
    return Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined && v !== null && v !== ""))
  } */

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
  
  export const createActivity = (form, { fallbackTripId = null } = {}) => {
    const body = toActivityRequestDTO({ form, original: null, fallbackTripId })
    return client('/api/activities', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
  
  export const updateActivity = (id, { form, original }) => {
    const body = toActivityRequestDTO({ 
        form, 
        original
    })
    return client(`/api/activities/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }
  
  export const deleteActivity = (id) =>
    client(`/api/activities/${encodeURIComponent(id)}`, { method: 'DELETE' })