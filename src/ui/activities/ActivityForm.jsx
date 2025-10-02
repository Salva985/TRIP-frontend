// src/ui/ActivityForm.jsx
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
  Link,
} from "react-router-dom";
import {
  createActivity,
  getActivity,
  updateActivity,
} from "../../api/activitiesApi";
import { listTrips } from "../../api/tripsApi";
import { changed, Was, ChangedPill } from "../../helpers/formDiffHelpers";

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
          organizer: "",
        };
      return f;
    });
  }, [form.type]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.title?.trim()) return setError(new Error("Title is required"));
    if (!form.type?.trim())
      return setError(
        new Error(
          "Type is required (SIGHTSEEING | ADVENTURE | CULTURAL | OTHER)"
        )
      );
    if (!form.date?.trim()) return setError(new Error("Date is required"));

    try {
      if (isEdit) {
        const tripId = form.tripId || original?.tripId;
        if (!tripId) return setError(new Error("Trip is required"));
        await updateActivity(id, { form: { ...form, tripId }, original });
        navigate(`/trips/${tripId}`);
      } else {
        if (!form.tripId) return setError(new Error("Trip is required"));
        const res = await createActivity(
          { ...form, tripId: Number(form.tripId) },
          { fallbackTripId: Number(form.tripId) }
        );
        const tripIdToGo =
          (res && (res.tripId || res.trip?.id)) ?? Number(form.tripId);
        navigate(`/trips/${tripIdToGo}`);
      }
    } catch (err) {
      setError(err);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <section className="max-w-2xl">
      {/* Page title */}
      <h2 className="text-xl font-semibold mb-3">
        {isEdit ? "Edit Activity" : "New Activity"}
      </h2>

      {/* Original summary (edit mode) */}
      {isEdit && original && (
        <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-900">Original details</h3>
          <dl className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Trip</dt>
              <dd className="text-gray-900">
                {original.tripName || `Trip #${original.tripId}`}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="text-gray-900">{original.type}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Date</dt>
              <dd className="text-gray-900">{original.date}</dd>
            </div>
            {original.notes && (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Notes</dt>
                <dd className="text-gray-900">{original.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Card */}
      <form
        onSubmit={onSubmit}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 space-y-4"
      >
        {/* Trip info / selector */}
        {isEdit && original && (
          <p className="text-sm text-gray-600">
            Trip:{" "}
            <strong>{original.tripName || `Trip #${original.tripId}`}</strong>
          </p>
        )}

        {!isEdit && (
          <label className="block">
            <span className="text-sm text-gray-700">
              Trip <span className="text-red-500">*</span>
            </span>

            {tripsLoading ? (
              <div className="text-sm text-gray-500 mt-1">Loading trips…</div>
            ) : tripsError ? (
              <div className="text-sm text-gray-700 mt-1">
                Add a trip first 😉 &nbsp;
                <Link to="/trips/new" className="text-blue-600 underline">
                  create a trip
                </Link>
                .
              </div>
            ) : trips.length === 0 ? (
              <div className="text-sm text-gray-700 mt-1">
                You don’t have any trips yet.{" "}
                <Link to="/trips/new" className="text-blue-600 underline">
                  Create your first trip
                </Link>{" "}
                and then add activities.
              </div>
            ) : (
              <select
                name="tripId"
                value={form.tripId || ""}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a trip…</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.tripName || `Trip #${t.id}`}
                  </option>
                ))}
              </select>
            )}
          </label>
        )}

        {/* Title / Type / Date */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Title */}
          <label className="block">
            <span className="text-sm text-gray-700">
              Title <span className="text-red-500">*</span>
              <ChangedPill
                on={isEdit && original && changed(form.title, original.title)}
              />
            </span>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isEdit && original && changed(form.title, original.title) && (
              <Was value={original.title} />
            )}
          </label>

          {/* Type */}
          <label className="block">
            <span className="text-sm text-gray-700">
              Type <span className="text-red-500">*</span>
              <ChangedPill
                on={isEdit && original && changed(form.type, original.type)}
              />
            </span>
            <select
              name="type"
              value={form.type}
              onChange={onChange}
              disabled={isEdit} // keep type immutable on edit
              className="mt-1 w-full border rounded px-3 py-2 disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type…</option>
              <option value="SIGHTSEEING">SIGHTSEEING</option>
              <option value="ADVENTURE">ADVENTURE</option>
              <option value="CULTURAL">CULTURAL</option>
              <option value="OTHER">OTHER</option>
            </select>
            {isEdit && original && changed(form.type, original.type) && (
              <Was value={original.type} />
            )}
            {isEdit && (
              <p className="text-xs text-gray-500 mt-1">
                Type can’t be changed after creation.
              </p>
            )}
          </label>

          {/* Date */}
          <label className="block sm:col-span-2">
            <span className="text-sm text-gray-700">
              Date <span className="text-red-500">*</span>
              <ChangedPill
                on={isEdit && original && changed(form.date, original.date)}
              />
            </span>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isEdit && original && changed(form.date, original.date) && (
              <Was value={original.date} />
            )}
          </label>
        </div>

        {/* Notes */}
        <label className="block">
          <span className="text-sm text-gray-700">
            Notes
            <ChangedPill
              on={isEdit && original && changed(form.notes, original.notes)}
            />
          </span>
          <textarea
            rows={4}
            name="notes"
            value={form.notes}
            onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isEdit && original && changed(form.notes, original.notes) && (
            <Was value={original.notes} />
          )}
        </label>

        {/* Subtype sections */}
        {form.type === "SIGHTSEEING" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-700">
                Landmark name
                <ChangedPill
                  on={
                    isEdit &&
                    original &&
                    changed(form.landmarkName, original.landmarkName)
                  }
                />
              </span>
              <input
                name="landmarkName"
                value={form.landmarkName}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isEdit &&
                original &&
                changed(form.landmarkName, original.landmarkName) && (
                  <Was value={original.landmarkName} />
                )}
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">
                Location
                <ChangedPill
                  on={
                    isEdit &&
                    original &&
                    changed(form.location, original.location)
                  }
                />
              </span>
              <input
                name="location"
                value={form.location}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isEdit &&
                original &&
                changed(form.location, original.location) && (
                  <Was value={original.location} />
                )}
            </label>
          </div>
        )}

        {form.type === "ADVENTURE" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-700">
                Difficulty level
                <ChangedPill
                  on={
                    isEdit &&
                    original &&
                    changed(form.difficultyLevel, original.difficultyLevel)
                  }
                />
              </span>
              <input
                name="difficultyLevel"
                value={form.difficultyLevel}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isEdit &&
                original &&
                changed(form.difficultyLevel, original.difficultyLevel) && (
                  <Was value={original.difficultyLevel} />
                )}
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">
                Equipment required
                <ChangedPill
                  on={
                    isEdit &&
                    original &&
                    changed(form.equipmentRequired, original.equipmentRequired)
                  }
                />
              </span>
              <input
                name="equipmentRequired"
                value={form.equipmentRequired}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isEdit &&
                original &&
                changed(form.equipmentRequired, original.equipmentRequired) && (
                  <Was value={original.equipmentRequired} />
                )}
            </label>
          </div>
        )}

        {form.type === "CULTURAL" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-700">
                Event name
                <ChangedPill
                  on={
                    isEdit &&
                    original &&
                    changed(form.eventName, original.eventName)
                  }
                />
              </span>
              <input
                name="eventName"
                value={form.eventName}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isEdit &&
                original &&
                changed(form.eventName, original.eventName) && (
                  <Was value={original.eventName} />
                )}
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">
                Organizer
                <ChangedPill
                  on={
                    isEdit &&
                    original &&
                    changed(form.organizer, original.organizer)
                  }
                />
              </span>
              <input
                name="organizer"
                value={form.organizer}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isEdit &&
                original &&
                changed(form.organizer, original.organizer) && (
                  <Was value={original.organizer} />
                )}
            </label>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm">
            Error: {error.message || JSON.stringify(error)}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isEdit ? "Save" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => history.back()}
            className="px-4 py-2 rounded border hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
