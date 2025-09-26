import { client } from './client'

export const listTrips = () =>
  client('/api/trips') 

export const createTrip = (dto) =>
    client("/api/trips", {
      method: "POST",
      body: JSON.stringify(dto),
    })