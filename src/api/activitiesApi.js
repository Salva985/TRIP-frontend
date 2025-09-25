import { client } from './client.js'

export async function listActivities({ search='', page=1, pageSize=10 } = {}) {
    const qs = new URLSearchParams()
    if (search) qs.set('search', search)
        qs.set('page', page)
        qs.set('pageSize', pageSize)

    try {
        const res = await client(`/api/activities/search?${qs.toString()}`)
        if (res?.data && res?.meta) return res
    } catch (e) {
        if (![400, 404, 405].includes(e.status)) throw e
    }

    const all = await client('api/activities')
    const filtered = search
        ? all.filter(a => {
            const title = (a.title || a.activityName || '').toLowerCase()
            const type  = (a.type  || a.activityType  || '').toLowerCase()
            const q = search.toLowerCase()
            return title.includes(q) || type.includes(q)
        })
        : all
    
    const start = (page-1) * pageSize
    const data = filtered.slice(start, start + pageSize)
    const meta = { page, pageSize, total: filtered.length }
    return { data, meta }
}

export const getActivity = (id) => client('/api/activities/${id}')

export const createActivity = (payload) => 
    client(`api/activities`, {
        method: 'POST',
        body: JSON.stringify(payload)
    })

export const updateActivity = (id, payload) => 
    client(`/api/activities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })

export const deleteActivity = (id) => 
    client(`api/activities/${id}`, {
        method: 'DELETE'
    })

export async function checkHealth() {
    const path = import.meta.env.VITE_HEALTH_PATH || 'api/health'
    return client(path)
}