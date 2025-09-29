const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

// join base + path ensuring exactly one slash between them
function join(baseUrl, path) {
  const b = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

export async function client(path, { method = 'GET', headers, body } = {}) {
  const url = join(base, path)

  const finalHeaders = { Accept: 'application/json', ...headers }
  const hasBody = body !== undefined && body !== null

  if (hasBody && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json'
  }

  const options = { method, headers: finalHeaders }
  if (hasBody) options.body = body

  const res = await fetch(url, options)

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`)
    err.status = res.status
    try { err.detail = await res.text() } catch { err.detail = '' }
    throw err
  }

  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : null
  
}