// src/api/client.js

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';

function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return new URL(p, BASE).toString();
}

function getToken() {
  try {
    return localStorage.getItem('auth_token') || null;
  } catch {
    return null;
  }
}

export async function client(path, { method = 'GET', headers, body } = {}) {
  const url = apiUrl(path);

  const finalHeaders = { Accept: 'application/json', ...(headers || {}) };
  const hasBody = body !== undefined && body !== null;

  if (hasBody && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: hasBody ? body : undefined,
  });

  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');

  if (!res.ok) {
    let server = null;
    try {
      server = isJson ? await res.json() : await res.text();
    } catch {}

    const msg =
      (server && typeof server === 'object' && (server.message || server.error)) ||
      (typeof server === 'string' && server.slice(0, 500)) ||
      `HTTP ${res.status} ${res.statusText}`;

    const err = new Error(msg);
    err.status = res.status;
    err.detail = server;
    throw err;
  }

  return isJson ? res.json() : (await res.text().catch(() => '')) || null;
}