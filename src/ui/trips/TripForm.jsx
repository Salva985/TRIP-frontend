// src/ui/TripForm.jsx
import { useEffect, useState } from "react";
import { createTrip } from "../../api/tripsApi";
import { listDestinations, createDestination } from "../../api/destinationsApi";

function toYMD(v) {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; // already ok
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(v);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return v;
}

export default function TripForm({ onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [tripType, setTripType] = useState("");
  const [notes, setNotes] = useState("");

  const [destinations, setDestinations] = useState([]);
  const [destLoading, setDestLoading] = useState(true);
  const [destError, setDestError] = useState(null);

  const [creatingDest, setCreatingDest] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newTz, setNewTz] = useState("");
  const [newCurrency, setNewCurrency] = useState("");
  const [destCreateError, setDestCreateError] = useState(null);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let off = false;
    setDestLoading(true);
    listDestinations()
      .then((data) => {
        if (!off) setDestinations(data || []);
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
  }, []);

  function onDestinationChange(e) {
    const v = e.target.value;
    if (v === "__new_dest__") {
      setCreatingDest(true);
      setDestinationId("");
    } else {
      setDestinationId(v ? Number(v) : "");
    }
  }

  async function onCreateDestination() {
    setDestCreateError(null);
    const city = newCity.trim();
    const country = newCountry.trim();
    const timezone = newTz.trim();
    const currencyCode = newCurrency.trim();

    if (!city || !country || !timezone || !currencyCode) {
      setDestCreateError(new Error("All destination fields are required."));
      return;
    }

    const exists = destinations.some(
      (d) =>
        d.city.toLowerCase() === city.toLowerCase() &&
        d.country.toLowerCase() === country.toLowerCase()
    );
    if (exists) {
      setDestCreateError(new Error("This destination already exists."));
      return;
    }

    try {
      const created = await createDestination({
        city,
        country,
        timezone,
        currencyCode,
      });
      setDestinations((prev) => [...prev, created]);
      setDestinationId(created.id);
      setCreatingDest(false);
      setNewCity("");
      setNewCountry("");
      setNewTz("");
      setNewCurrency("");
    } catch (err) {
      setDestCreateError(err);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      name: name.trim(),
      startDate: toYMD(startDate),
      endDate: toYMD(endDate),
      destinationId: destinationId ? Number(destinationId) : null,
      tripType: tripType || undefined,
      notes: notes.trim() || undefined,
    };

    if (!payload.name) {
      setSubmitting(false);
      return setError(new Error("Trip name is required"));
    }
    if (!payload.startDate) {
      setSubmitting(false);
      return setError(new Error("Start date is required"));
    }
    if (!payload.endDate) {
      setSubmitting(false);
      return setError(new Error("End date is required"));
    }
    if (!payload.destinationId) {
      setSubmitting(false);
      return setError(new Error("Destination is required"));
    }
    if (payload.endDate < payload.startDate) {
      setSubmitting(false);
      return setError(new Error("End date must be after start date"));
    }

    try {
      console.log("TRIP CREATE payload →", payload);
      const created = await createTrip(payload);
      onSuccess?.(created);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-3">New Trip</h2>
  
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
        {/* Trip name */}
        <label className="block">
          <span className="text-sm text-gray-700">Trip name <span className="text-red-500">*</span></span>
          <input
            className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. London Adventure Week"
          />
        </label>
  
        {/* Dates */}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">Start date <span className="text-red-500">*</span></span>
            <input
              type="date"
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
  
          <label className="block">
            <span className="text-sm text-gray-700">End date <span className="text-red-500">*</span></span>
            <input
              type="date"
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>
  
        {/* Destination selector */}
        <label className="block">
          <span className="text-sm text-gray-700">Destination <span className="text-red-500">*</span></span>
          <select
            className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={creatingDest ? "__new_dest__" : destinationId || ""}
            onChange={onDestinationChange}
          >
            <option value="">Select destination…</option>
            {destLoading ? (
              <option disabled>Loading…</option>
            ) : destError ? (
              <option disabled>Failed to load</option>
            ) : (
              destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.city}, {d.country}
                </option>
              ))
            )}
            <option value="__new_dest__">+ New destination…</option>
          </select>
        </label>
  
        {/* Inline NEW destination */}
        {creatingDest && (
          <div className="space-y-3 border rounded-lg p-3 sm:p-4 bg-gray-50">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City *"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
              />
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Country *"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
              />
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Timezone * (e.g. Europe/Madrid)"
                value={newTz}
                onChange={(e) => setNewTz(e.target.value)}
              />
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value)}
              >
                <option value="">Select currency…</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
  
            {destCreateError && (
              <p className="text-sm text-red-600">{destCreateError.message}</p>
            )}
  
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCreateDestination}
                className="px-4 py-2 rounded border hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create destination
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatingDest(false);
                  setDestCreateError(null);
                  setNewCity("");
                  setNewCountry("");
                  setNewTz("");
                  setNewCurrency("");
                }}
                className="px-4 py-2 rounded border hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
  
        {/* Optional fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">Trip type (optional)</span>
            <select
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
            >
              <option value="">—</option>
              <option value="LEISURE">LEISURE</option>
              <option value="BUSINESS">BUSINESS</option>
              <option value="ADVENTURE">ADVENTURE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>
  
          <label className="block">
            <span className="text-sm text-gray-700">Notes (optional)</span>
            <input
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything to remember…"
            />
          </label>
        </div>
  
        {/* Error */}
        {error && (
          <p className="text-sm text-red-600">
            {error.detail || error.message || "Failed to create trip"}
          </p>
        )}
  
        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {submitting ? "Creating…" : "Create trip"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded border hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}