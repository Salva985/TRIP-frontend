import { client } from './client'

function normalizeTrip(t) {
  if (!t) return t;
  // If backend already returns nested destination, keep it. Else build it.
  const destination =
    t.destination ??
    (t.destinationCity || t.destinationCountry
      ? { id: t.destinationId, city: t.destinationCity, country: t.destinationCountry }
      : undefined);

  return { ...t, destination };
}

export const listTrips = () =>
  client('/api/trips') 

export const createTrip = (dto) =>
    client("/api/trips", {
      method: "POST",
      body: JSON.stringify(dto),
    })

export const getTrip = (id) =>
    client(`/api/trips/${encodeURIComponent(id)}`)

export const updateTrip = (id, body) =>
  client(`/api/trips/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteTrip = (id) =>
    client(`/api/trips/${encodeURIComponent(id)}`, {
        method: "DELETE",
    })