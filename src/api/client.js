const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function client(path, { method = 'GET', headers, body } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body
  })

  if (!res.ok) {
    let detail = ''
    try { detail = await res.text() } catch {}
    const error = new Error(`HTTP ${res.status} ${res.statusText}`)
    error.status = res.status
    error.detail = detail
    throw error
  }

  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : null
}