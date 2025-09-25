import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { listActivities } from '../api/activitiesApi'

export default function ActivitiesList() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const pageSize = Number(params.get('pageSize') || 10)
  const search = params.get('search') || ''

  const [q, setQ] = useState(search)
  const [state, setState] = useState({
    loading: true, error: null, data: [], meta: { page, pageSize, total: 0 }
  })

  useEffect(() => { setQ(search) }, [search])

  // debounce search -> update URL params
  useEffect(() => {
    const id = setTimeout(() => {
      setParams(p => {
        q ? p.set('search', q) : p.delete('search')
        p.set('page', '1')
        p.set('pageSize', String(pageSize))
        return p
      })
    }, 400)
    return () => clearTimeout(id)
  }, [q, pageSize, setParams])

  // fetch list
  useEffect(() => {
    let off = false
    setState(s => ({ ...s, loading: true, error: null }))
    listActivities({ search, page, pageSize })
      .then(res => !off && setState({ loading: false, error: null, data: res.data, meta: res.meta }))
      .catch(err => !off && setState({ loading: false, error: err, data: [], meta: { page, pageSize, total: 0 } }))
    return () => { off = true }
  }, [search, page, pageSize])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.meta.total / state.meta.pageSize)),
    [state.meta]
  )

  return (
    <section className="space-y-4">
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Buscar por título o tipo…"
        value={q}
        onChange={e => setQ(e.target.value)}
      />

      {state.loading && <p>Loading…</p>}
      {state.error && <p className="text-red-600">Error: {state.error.message}</p>}
      {!state.loading && !state.error && state.data.length === 0 && <p>Sin resultados.</p>}

      <ul className="divide-y border rounded">
        {state.data.map(a => (
          <li key={a.id} className="p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{a.title || a.activityName || `Activity #${a.id}`}</p>
              <p className="text-sm opacity-75">{a.type || a.activityType || '—'}</p>
            </div>
            <div className="flex gap-2">
              <Link className="px-2 py-1 border rounded" to={`/activities/${a.id}`}>View</Link>
              <Link className="px-2 py-1 border rounded" to={`/activities/${a.id}/edit`}>Edit</Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <button
          className="px-3 py-2 border rounded disabled:opacity-50"
          onClick={() => setParams(p => { p.set('page', String(Math.max(1, page - 1))); return p })}
          disabled={page <= 1}
        >Previous</button>

        <span className="text-sm">Page {page} / {totalPages}</span>

        <button
          className="px-3 py-2 border rounded disabled:opacity-50"
          onClick={() => setParams(p => { p.set('page', String(page + 1)); return p })}
          disabled={page >= totalPages}
        >Next</button>
      </div>
    </section>
  )
}