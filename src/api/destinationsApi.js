import { client } from "./client"

export const listDestinations = () => client("/api/destinations")

export const createDestination = (dto) =>
    client("/api/destinations", {
      method: "POST",
      body: JSON.stringify(dto),
    })