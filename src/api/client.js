const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

function join(baseUrl, path) {
  const b = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export async function client(path, { method = 'GET', headers, body } = {}) {
  const url = join(base, path);

  const finalHeaders = { Accept: 'application/json', ...headers };
  const hasBody = body !== undefined && body !== null;

  if (hasBody && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const options = { method, headers: finalHeaders };
  if (hasBody) options.body = body;

  const res = await fetch(url, options);

  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { /* ignore */ }
    const short = detail?.trim()?.slice(0, 500); // keep it readable
    const err = new Error(`HTTP ${res.status} ${res.statusText}${short ? ` — ${short}` : ''}`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }

  if (isJson) return res.json();
  const text = await res.text().catch(() => '');
  return text || null;
}