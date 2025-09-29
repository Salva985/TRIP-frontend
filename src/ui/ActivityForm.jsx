// src/ui/ActivityForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  createActivity,
  getActivity,
  updateActivity,
} from "../api/activitiesApi";
import { listTrips } from "../api/tripsApi";

export default function ActivityForm({ mode }) {
  const isEdit = mode === "edit";
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    tripId: "",
    title: "",
    type: "",
    date: "",
    notes: "",
    landmarkName: "",
    location: "",
    difficultyLevel: "",
    equipmentRequired: "",
    eventName: "",
    organizer: "",
  });
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  // trips (create mode)
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(!isEdit);
  const [tripsError, setTripsError] = useState(null);

  // Load existing activity on edit
  useEffect(() => {
    if (!isEdit) return;
    let off = false;
    getActivity(id)
      .then((a) => {
        if (off) return;
        setOriginal(a);
        setForm((f) => ({
          ...f,
          tripId: a.tripId ?? f.tripId ?? "",
          title: a.title ?? "",
          type: a.type ?? "",
          date: a.date ?? "",
          notes: a.notes ?? "",
          landmarkName: a.landmarkName ?? "",
          location: a.location ?? "",
          difficultyLevel: a.difficultyLevel ?? "",
          equipmentRequired: a.equipmentRequired ?? "",
          eventName: a.eventName ?? "",
          organizer: a.organizer ?? "",
        }));
        setLoading(false);
      })
      .catch((e) => {
        if (!off) {
          setError(e);
          setLoading(false);
        }
      });
    return () => {
      off = true;
    };
  }, [id, isEdit]);

  // Prefill from ?tripId= when creating
  useEffect(() => {
    if (isEdit) return;
    const tid = searchParams.get("tripId");
    if (tid) setForm((f) => ({ ...f, tripId: Number(tid) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch trips for selector (create mode)
  useEffect(() => {
    if (isEdit) return;
    let off = false;
    setTripsLoading(true);
    setTripsError(null);
    listTrips()
      .then((t) => {
        if (!off) setTrips(t);
      })
      .catch((e) => {
        if (!off) setTripsError(e);
      })
      .finally(() => {
        if (!off) setTripsLoading(false);
      });
    return () => {
      off = true;
    };
  }, [isEdit]);

  function onChange(e) {
    const { name, value } = e.target;
    if (name === "tripId") {
      setForm((f) => ({ ...f, tripId: value ? Number(value) : "" }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Clear irrelevant subtype fields when type changes
  useEffect(() => {
    setForm((f) => {
      if (f.type === "SIGHTSEEING")
        return {
          ...f,
          difficultyLevel: "",
          equipmentRequired: "",
          eventName: "",
          organizer: "",
        };
      if (f.type === "ADVENTURE")
        return {
          ...f,
          landmarkName: "",
          location: "",
          eventName: "",
          organizer: "",
        };
      if (f.type === "CULTURAL")
        return {
          ...f,
          landmarkName: "",
          location: "",
          difficultyLevel: "",
          equipmentRequired: "",
        };
        if (f.type === "OTHER") 
          return { 
        ...f,
        landmarkName: "", 
        location: "", 
        difficultyLevel: "", 
        equipmentRequired: "", 
        eventName: "", 
        organizer: "" };
      return f;
    });
  }, [form.type]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError(new Error("Title is required"));
    if (!form.type?.trim())
      return setError(
        new Error("Type is required (SIGHTSEEING | ADVENTURE | CULTURAL | OTHER)")
      );
    if (!form.date?.trim()) return setError(new Error("Date is required"));

    try {
      if (isEdit) {
        const tripId = form.tripId || original?.tripId;
        if (!tripId) return setError(new Error("Trip is required"));
        await updateActivity(id, { form: { ...form, tripId }, original });
      } else {
        if (!form.tripId) return setError(new Error("Trip is required"));
        await createActivity({ ...form, tripId: Number(form.tripId) });
      }
      navigate("/");
    } catch (err) {
      setError(err);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <form className="space-y-3 max-w-lg" onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold">
        {isEdit ? "Edit Activity" : "New Activity"}
      </h2>

      {/* Trip info / selector */}
      {isEdit && original && (
        <p className="text-sm opacity-75">
          Trip:{" "}
          <strong>{original.tripName || `Trip #${original.tripId}`}</strong>
        </p>
      )}

      {!isEdit && (
        <label className="block">
          <span className="text-sm">Trip *</span>
          {tripsLoading ? (
            <div className="text-sm opacity-70">Loading trips…</div>
          ) : tripsError ? (
            <div className="text-sm text-red-600">Failed to load trips</div>
          ) : (
            <>
              <select
                className="border rounded px-3 py-2 w-full"
                name="tripId"
                value={form.tripId || ""}
                onChange={onChange}
              >
                <option value="">Select a trip…</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.tripName || `Trip #${t.id}`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Don’t see your trip?{" "}
                <a
                  className="underline"
                  href="/trips"
                  target="_blank"
                  rel="noreferrer"
                >
                  Create one
                </a>{" "}
                and come back.
              </p>
            </>
          )}
        </label>
      )}

      {/* Title */}
      <label className="block">
        <span className="text-sm">Title *</span>
        <input
          className="border rounded px-3 py-2 w-full"
          name="title"
          value={form.title}
          onChange={onChange}
        />
      </label>

      {/* Type */}
      <label className="block">
        <span className="text-sm">Type *</span>
        <select
          className="border rounded px-3 py-2 w-full"
          name="type"
          value={form.type}
          onChange={onChange}
        >
          <option value="">Select type…</option>
          <option value="SIGHTSEEING">SIGHTSEEING</option>
          <option value="ADVENTURE">ADVENTURE</option>
          <option value="CULTURAL">CULTURAL</option>
          <option value="OTHER">OTHER</option>
        </select>
      </label>

      {/* Date */}
      <label className="block">
        <span className="text-sm">Date *</span>
        <input
          type="date"
          className="border rounded px-3 py-2 w-full"
          name="date"
          value={form.date}
          onChange={onChange}
        />
      </label>

      {/* Notes */}
      <label className="block">
        <span className="text-sm">Notes</span>
        <textarea
          className="border rounded px-3 py-2 w-full"
          rows={4}
          name="notes"
          value={form.notes}
          onChange={onChange}
        />
      </label>

      {/* Subtype blocks */}
      {form.type === "SIGHTSEEING" && (
        <>
          <label className="block">
            <span className="text-sm">Landmark name</span>
            <input
              className="border rounded px-3 py-2 w-full"
              name="landmarkName"
              value={form.landmarkName}
              onChange={onChange}
            />
          </label>
          <label className="block">
            <span className="text-sm">Location</span>
            <input
              className="border rounded px-3 py-2 w-full"
              name="location"
              value={form.location}
              onChange={onChange}
            />
          </label>
        </>
      )}
      {form.type === "ADVENTURE" && (
        <>
          <label className="block">
            <span className="text-sm">Difficulty level</span>
            <input
              className="border rounded px-3 py-2 w-full"
              name="difficultyLevel"
              value={form.difficultyLevel}
              onChange={onChange}
            />
          </label>
          <label className="block">
            <span className="text-sm">Equipment required</span>
            <input
              className="border rounded px-3 py-2 w-full"
              name="equipmentRequired"
              value={form.equipmentRequired}
              onChange={onChange}
            />
          </label>
        </>
      )}
      {form.type === "CULTURAL" && (
        <>
          <label className="block">
            <span className="text-sm">Event name</span>
            <input
              className="border rounded px-3 py-2 w-full"
              name="eventName"
              value={form.eventName}
              onChange={onChange}
            />
          </label>
          <label className="block">
            <span className="text-sm">Organizer</span>
            <input
              className="border rounded px-3 py-2 w-full"
              name="organizer"
              value={form.organizer}
              onChange={onChange}
            />
          </label>
        </>
      )}

      {error && (
        <p className="text-red-600 text-sm">
          Error: {error.message || JSON.stringify(error)}
        </p>
      )}

      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded" type="submit">
          {isEdit ? "Save" : "Create"}
        </button>
        <button
          className="px-3 py-2 border rounded"
          type="button"
          onClick={() => history.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
