// src/ui/trips/TripForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { createTrip, getTrip, updateTrip } from "../../api/tripsApi";
import { listDestinations, createDestination } from "../../api/destinationsApi";
import { changed, Was, ChangedPill } from "../../helpers/formDiffHelpers";

function toYMD(v) {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(v);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return v;
}

// just an alias used for “was:” display
const fmtYMD = toYMD;

export default function TripForm({ onSuccess, onCancel, mode, edit }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isEdit =
    mode === "edit" || edit === true || (id && location.pathname.endsWith("/edit"));

  // form state
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [tripType, setTripType] = useState("");
  const [notes, setNotes] = useState("");

  // original for comparison (edit)
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  // destinations
  const [destinations, setDestinations] = useState([]);
  const [destLoading, setDestLoading] = useState(true);
  const [destError, setDestError] = useState(null);

  // inline create dest
  const [creatingDest, setCreatingDest] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newTz, setNewTz] = useState("");
  const [newCurrency, setNewCurrency] = useState("");
  const [destCreateError, setDestCreateError] = useState(null);

  // submit state
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load destinations once
  useEffect(() => {
    let off = false;
    setDestLoading(true);
    listDestinations()
      .then((data) => { if (!off) setDestinations(data || []); })
      .catch((e) => { if (!off) setDestError(e); })
      .finally(() => { if (!off) setDestLoading(false); });
    return () => { off = true; };
  }, []);

  // Load trip when editing
  useEffect(() => {
    if (!isEdit) return;
    let off = false;
    setLoading(true);
    setError(null);
    getTrip(id)
      .then((t) => {
        if (off) return;
        setOriginal(t);
        setName(t.name || "");
        setStartDate(fmtYMD(t.startDate));
        setEndDate(fmtYMD(t.endDate));
        setDestinationId(t.destination?.id ?? t.destinationId ?? "");
        setTripType(t.tripType || "");
        setNotes(t.notes || "");
      })
      .catch((e) => { if (!off) setError(e); })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, [id, isEdit]);

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
      const created = await createDestination({ city, country, timezone, currencyCode });
      setDestinations((prev) => [...prev, created]);
      setDestinationId(created.id);
      setCreatingDest(false);
      setNewCity(""); setNewCountry(""); setNewTz(""); setNewCurrency("");
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

    const fail = (msg) => { setSubmitting(false); setError(new Error(msg)); };

    // validations
    if (!payload.name) return fail("Trip name is required");
    if (!payload.startDate) return fail("Start date is required");
    if (!payload.endDate) return fail("End date is required");
    if (!payload.destinationId) return fail("Destination is required");
    if (payload.endDate < payload.startDate) return fail("End date must be after start date");

    try {
      if (isEdit) {
        await updateTrip(id, payload);
        navigate(`/trips/${id}`);
      } else {
        const created = await createTrip(payload);
        onSuccess?.(created);
      }
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  const originalDestLabel = useMemo(() => {
    if (!original) return "";
    const city = original.destination?.city ?? original.destinationCity;
    const country = original.destination?.country ?? original.destinationCountry;
    if (!city && !country) return `#${original.destinationId || "—"}`;
    return `${city || ""}${city && country ? ", " : ""}${country || ""}`;
  }, [original]);

  if (loading) return <p>Loading…</p>;

  return (
    <section className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-3">
        {isEdit ? "Edit Trip" : "New Trip"}
      </h2>

      <form
        onSubmit={onSubmit}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 space-y-4"
      >
        {/* Trip name */}
        <label className="block">
          <span className="text-sm text-gray-700">
            Trip name <span className="text-red-500">*</span>
            {isEdit && original && (
              <>
                <span className="mx-2"><Was value={original.name} /></span>
                <ChangedPill on={changed(name, original.name)} />
              </>
            )}
          </span>
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
            <span className="text-sm text-gray-700">
              Start date <span className="text-red-500">*</span>
              {isEdit && original && (
                <>
                  <span className="mx-2"><Was value={fmtYMD(original.startDate)} /></span>
                  <ChangedPill on={changed(startDate, fmtYMD(original.startDate))} />
                </>
              )}
            </span>
            <input
              type="date"
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">
              End date <span className="text-red-500">*</span>
              {isEdit && original && (
                <>
                  <span className="mx-2"><Was value={fmtYMD(original.endDate)} /></span>
                  <ChangedPill on={changed(endDate, fmtYMD(original.endDate))} />
                </>
              )}
            </span>
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
          <span className="text-sm text-gray-700">
            Destination <span className="text-red-500">*</span>
            {isEdit && original && (
              <>
                <span className="mx-2"><Was value={originalDestLabel} /></span>
                <ChangedPill
                  on={changed(
                    String(destinationId || ""),
                    String(original.destination?.id ?? original.destinationId ?? "")
                  )}
                />
              </>
            )}
          </span>
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
            <span className="text-sm text-gray-700">
              Trip type (optional)
              {isEdit && original && (
                <>
                  <span className="mx-2"><Was value={original.tripType || "—"} /></span>
                  <ChangedPill on={changed(tripType || "", original.tripType || "")} />
                </>
              )}
            </span>
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
            <span className="text-sm text-gray-700">
              Notes (optional)
              {isEdit && original && (
                <>
                  <span className="mx-2"><Was value={original.notes || "—"} /></span>
                  <ChangedPill on={changed(notes || "", original.notes || "")} />
                </>
              )}
            </span>
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
            {error.detail ||
              error.message ||
              (isEdit ? "Failed to update trip" : "Failed to create trip")}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {submitting ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save" : "Create trip")}
          </button>
          <button
            type="button"
            onClick={onCancel ?? (() => history.back())}
            className="px-4 py-2 rounded border hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}