import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createActivity,
  getActivity,
  updateActivity,
} from "../api/activitiesApi";
import { listTrips, createTrip } from "../api/tripsApi";
import { listDestinations, createDestination } from "../api/destinationsApi";

export default function ActivityForm({ mode }) {
  const isEdit = mode === "edit";
  const { id } = useParams();
  const navigate = useNavigate();

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

  // Trips for the selector
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState(null);

  // Inline “new trip” UI state
  const [creatingTrip, setCreatingTrip] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripStart, setNewTripStart] = useState("");
  const [newTripEnd, setNewTripEnd] = useState("");
  const [newTripDestinationId, setNewTripDestinationId] = useState("");
  const [tripCreateError, setTripCreateError] = useState(null);

  // Destinations for the new trip
  const [destinations, setDestinations] = useState([]);
  const [destLoading, setDestLoading] = useState(false);
  const [destError, setDestError] = useState(null);

  // Inline “new destination” (required fields per DTO)
  const [creatingDest, setCreatingDest] = useState(false);
  const [newDestCity, setNewDestCity] = useState("");
  const [newDestCountry, setNewDestCountry] = useState("");
  const [newDestTimezone, setNewDestTimezone] = useState("");
  const [newDestCurrency, setNewDestCurrency] = useState("");
  const [destCreateError, setDestCreateError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    let off = false;
    getActivity(id)
      .then((a) => {
        if (off) return;
        setOriginal(a);
        setForm((f) => ({
          ...f,
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

  // FETCH TRIPS (only when creating)
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

  // FETCH DESTINATIONS
  useEffect(() => {
    if (isEdit) return;
    let off = false;
    setDestLoading(true);
    setDestError(null);
    listDestinations()
      .then((d) => {
        if (!off) setDestinations(d);
      })
      .catch((e) => {
        if (!off) setDestError(e);
      })
      .finally(() => {
        if (!off) setDestLoading(false);
      });
    return () => {
      off = true;
    };
  }, [isEdit]);

  function onChange(e) {
    const { name, value } = e.target;

    if (name === "tripId") {
      if (value === "__new__") {
        setCreatingTrip(true);
        setForm((f) => ({ ...f, tripId: "" }));
        return;
      }
      setForm((f) => ({ ...f, tripId: value ? Number(value) : "" }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  }

  // When type changes, clear irrelevant subtype fields
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
      return f;
    });
  }, [form.type]);

  async function onCreateDestination() {
    setDestCreateError(null)
  
    const city = newDestCity.trim()
    const country = newDestCountry.trim()
    const timezone = newDestTimezone.trim()
    const currencyCode = newDestCurrency.trim()
  
    if (!city || !country || !timezone || !currencyCode) {
      setDestCreateError(new Error("All destination fields are required"))
      return
    }
  
    const dto = { city, country, timezone, currencyCode }
  
    try {
      const created = await createDestination(dto)
  
      // Add to the list and select it for the Trip creator
      setDestinations(prev => [...prev, created])
      setNewTripDestinationId(created.id)
  
      // Reset inline UI
      setCreatingDest(false)
      setNewDestCity(""); setNewDestCountry(""); setNewDestTimezone(""); setNewDestCurrency("")
    } catch (err) {
      setDestCreateError(err)
    }
  }

  async function onCreateTrip() {
    setTripCreateError(null);

    const dto = {
      name: newTripName.trim(),
      startDate: newTripStart || null,
      endDate: newTripEnd || null,
      destinationId: newTripDestinationId ? Number(newTripDestinationId) : null,
      // tripType: undefined, // optional: add a selector if you want
      // notes: undefined,
    };

    // Minimal validation to satisfy backend
    if (!dto.name)
      return setTripCreateError(new Error("Trip name is required"));
    if (!dto.startDate || !dto.endDate)
      return setTripCreateError(new Error("Start and end dates are required"));
    if (!dto.destinationId)
      return setTripCreateError(new Error("Destination is required"));

    try {
      const t = await createTrip(dto);
      // Add to dropdown and select it
      setTrips((prev) => [...prev, t]);
      setForm((f) => ({ ...f, tripId: t.id }));

      // Reset inline UI
      setNewTripName("");
      setNewTripStart("");
      setNewTripEnd("");
      setNewTripDestinationId("");
      setCreatingTrip(false);
    } catch (err) {
      setTripCreateError(err);
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
  
    if (!form.title.trim()) {
      setError(new Error("Title is required"))
      return
    }
    if (!form.type?.trim()) {
      setError(new Error("Type is required (SIGHTSEEING | ADVENTURE | CULTURAL)"))
      return
    }
    if (!form.date?.trim()) {
      setError(new Error("Date is required"))
      return
    }
  
    try {
      if (isEdit) {
        const tripId = form.tripId || original?.tripId
        if (!tripId) {
          setError(new Error("Trip is required"))
          return
        }
        await updateActivity(id, { ...form, tripId })
      } else {
        if (!form.tripId) {
          setError(new Error("Trip is required"))
          return
        }
        await createActivity({ ...form, tripId: Number(form.tripId) })
      }
      navigate("/")
    } catch (err) {
      setError(err)
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <form className="space-y-3 max-w-lg" onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold">
        {isEdit ? "Edit Activity" : "New Activity"}
      </h2>
  
      {/* Show Trip name (read-only) in Edit mode */}
      {isEdit && original && (
        <p className="text-sm opacity-75">
          Trip: <strong>{original.tripName || `Trip #${original.tripId}`}</strong>
        </p>
      )}
  
      {/* Trip selector */}
      {!isEdit && (
        <div className="space-y-2">
          <label className="block">
            <span className="text-sm">Trip *</span>
            {tripsLoading ? (
              <div className="text-sm opacity-70">Loading trips…</div>
            ) : tripsError ? (
              <div className="text-sm text-red-600">Failed to load trips</div>
            ) : (
              <select
                className="border rounded px-3 py-2 w-full"
                name="tripId"
                value={creatingTrip ? "__new__" : form.tripId || ""}
                onChange={onChange}
              >
                <option value="">Select a trip…</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.tripName || `Trip #${t.id}`}
                  </option>
                ))}
                <option value="__new__">+ New trip…</option>
              </select>
            )}
          </label>
  
          {creatingTrip && (
            <div className="space-y-2 border rounded p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {/* New trip name */}
                <input
                  className="border rounded px-3 py-2"
                  placeholder="New trip name"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                />
  
                {/* Destination select */}
                <select
                  className="border rounded px-3 py-2"
                  value={newTripDestinationId}
                  onChange={(e) => setNewTripDestinationId(e.target.value)}
                >
                  <option value="">Select destination…</option>
                  {destLoading ? (
                    <option disabled>Loading…</option>
                  ) : destError ? (
                    <option disabled>Failed to load</option>
                  ) : (
                    destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name || d.city || `Destination #${d.id}`}
                      </option>
                    ))
                  )}
                </select>
  
                {/* Trip dates */}
                <input
                  type="date"
                  className="border rounded px-3 py-2"
                  placeholder="Start date"
                  value={newTripStart}
                  onChange={(e) => setNewTripStart(e.target.value)}
                />
                <input
                  type="date"
                  className="border rounded px-3 py-2"
                  placeholder="End date"
                  value={newTripEnd}
                  onChange={(e) => setNewTripEnd(e.target.value)}
                />
              </div>
  
              {/* ───────────────────────────────────────────────
                  Inline NEW destination (required DTO fields)
                  DestinationRequestDTO: { city, country, timezone, currencyCode }
                 ─────────────────────────────────────────────── */}
              {!creatingDest ? (
                <button
                  type="button"
                  className="px-3 py-2 border rounded"
                  onClick={() => setCreatingDest(true)}
                >
                  + New destination…
                </button>
              ) : (
                <div className="space-y-2 sm:col-span-2 border rounded p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="City *"
                      value={newDestCity}
                      onChange={(e) => setNewDestCity(e.target.value)}
                    />
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Country *"
                      value={newDestCountry}
                      onChange={(e) => setNewDestCountry(e.target.value)}
                    />
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Timezone * (e.g. Europe/Madrid)"
                      value={newDestTimezone}
                      onChange={(e) => setNewDestTimezone(e.target.value)}
                    />
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Currency code * (e.g. EUR)"
                      value={newDestCurrency}
                      onChange={(e) => setNewDestCurrency(e.target.value)}
                    />
                  </div>
  
                  {destCreateError && (
                    <p className="text-sm text-red-600">{destCreateError.message}</p>
                  )}
  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-3 py-2 border rounded"
                      onClick={onCreateDestination}
                    >
                      Create destination
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 border rounded"
                      onClick={() => {
                        setCreatingDest(false)
                        setDestCreateError(null)
                        setNewDestCity("")
                        setNewDestCountry("")
                        setNewDestTimezone("")
                        setNewDestCurrency("")
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
  
              {/* Trip creation actions */}
              {tripCreateError && (
                <p className="text-sm text-red-600">{tripCreateError.message}</p>
              )}
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 border rounded"
                  type="button"
                  onClick={onCreateTrip}
                >
                  Create trip
                </button>
                <button
                  className="px-3 py-2 border rounded"
                  type="button"
                  onClick={() => {
                    setCreatingTrip(false)
                    setNewTripName("")
                    setNewTripStart("")
                    setNewTripEnd("")
                    setNewTripDestinationId("")
                    setTripCreateError(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
  
      {/* Title field */}
      <label className="block">
        <span className="text-sm">Title *</span>
        <input
          className="border rounded px-3 py-2 w-full"
          name="title"
          value={form.title}
          onChange={onChange}
        />
      </label>
  
      {/* Type field */}
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
        </select>
      </label>
  
      {/* Date field */}
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
  
      {/* Notes field */}
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
  )
}