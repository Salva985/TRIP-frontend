import { client } from "./client.js";

/** Normalize to "YYYY-MM-DD" or undefined */
function toYMD(v) {
  if (!v) return undefined;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (isNaN(d)) return undefined;
  return d.toISOString().slice(0, 10);
}

/** Build exactly what the Spring DTO expects */
function toActivityRequestDTO({ form = {}, original = null, fallbackTripId }) {
  // tripId must be numeric
  const tripIdRaw = form.tripId ?? original?.tripId ?? fallbackTripId;
  const tripId =
    tripIdRaw === "" || tripIdRaw == null ? undefined : Number(tripIdRaw);

  const dto = {
    tripId,                                     // Long (required)
    date:  toYMD(form.date ?? original?.date),  // LocalDate (required)
    title: form.title ?? original?.title,       // String (required)
    notes: form.notes ?? original?.notes,       // String (optional)
    type:  form.type ?? original?.type,         // ActivityType (required)

    // optional subtype fields — names must match backend DTO
    landmarkName:      form.landmarkName      ?? original?.landmarkName,
    location:          form.location          ?? original?.location,
    difficultyLevel:   form.difficultyLevel   ?? original?.difficultyLevel,
    equipmentRequired: form.equipmentRequired ?? original?.equipmentRequired,
    eventName:         form.eventName         ?? original?.eventName,
    organizer:         form.organizer         ?? original?.organizer,
  };

  return Object.fromEntries(
    Object.entries(dto).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

export async function listActivities({ search = "", page = 1, pageSize = 10 } = {}) {
  const all = await client("/api/activities");

  const filtered = search
    ? all.filter((a) => {
        const title = (a.title || a.activityName || "").toLowerCase();
        const type  = (a.type  || a.activityType  || "").toLowerCase();
        const q = search.toLowerCase();
        return title.includes(q) || type.includes(q);
      })
    : all;

  const start = (page - 1) * pageSize;
  const data  = filtered.slice(start, start + pageSize);
  const meta  = { page, pageSize, total: filtered.length };
  return { data, meta };
}

export const getActivity = (id) =>
  client(`/api/activities/${encodeURIComponent(id)}`);

export const createActivity = (form, { fallbackTripId } = {}) => {
  const body = toActivityRequestDTO({ form, original: null, fallbackTripId });
  console.log("ACTIVITY CREATE payload →", body);
  return client("/api/activities", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const updateActivity = (id, { form, original }) => {
  const body = toActivityRequestDTO({ form, original });
  console.log("ACTIVITY UPDATE payload →", body);
  return client(`/api/activities/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const deleteActivity = (id) =>
  client(`/api/activities/${encodeURIComponent(id)}`, { method: "DELETE" });