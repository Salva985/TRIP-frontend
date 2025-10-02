// src/ui/TripsList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listTrips, deleteTrip } from "../../api/tripsApi";
import TripForm from "./TripForm";
import { useAuth } from "../auth/AuthContext.jsx"; // adjust if your path differs

function todayYMD() {
  return new Date().toISOString().slice(0, 10);
}
function safeYMD(v) {
  // supports "YYYY-MM-DD" or Date-ish strings
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return isNaN(d) ? "" : d.toISOString().slice(0, 10);
}

export default function TripsList() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const when = (params.get("when") || "all").toLowerCase(); // "all" | "upcoming" | "past"

  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // fetch trips (unchanged)
  useEffect(() => {
    let off = false;
    setLoading(true);
    setError(null);
    listTrips()
      .then((data) => {
        if (!off) setTrips(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!off) setError(err);
      })
      .finally(() => {
        if (!off) setLoading(false);
      });
    return () => {
      off = true;
    };
  }, []);

  // client-side filter
  const filtered = useMemo(() => {
    const today = todayYMD();
    const arr = trips.filter((t) => {
      const end = safeYMD(t.endDate);
      if (!end) return when === "all"; // if date is weird, only show in "all"
      if (when === "upcoming") return end >= today;
      if (when === "past") return end < today;
      return true;
    });

    // a nice sort: upcoming → soonest first, past → most recent first
    const byStart = (a, b) =>
      safeYMD(a.startDate).localeCompare(safeYMD(b.startDate));
    const byEnd = (a, b) =>
      safeYMD(b.endDate).localeCompare(safeYMD(a.endDate));

    if (when === "upcoming") return arr.sort(byStart);
    if (when === "past") return arr.sort(byEnd);
    return arr;
  }, [trips, when]);

  async function onDelete(id) {
    const ok = window.confirm(
      "Are you sure you want to delete this trip? All activities in this trip will be lost permanently."
    );
    if (!ok) return;
    try {
      setDeletingId(id);
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err?.message || "Failed to delete trip.");
    } finally {
      setDeletingId(null);
    }
  }

  function onTripCreated(t) {
    setTrips((prev) => [...prev, t]);
    setShowCreate(false);
  }

  const userName = user?.username || user?.fullName || "";

  if (loading) return <p>Loading trips…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl font-semibold">Trips</h2>

        <div className="flex items-center gap-2">
          {/* When filter */}
          <select
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={when}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              next.set("when", e.target.value);
              setParams(next);
            }}
            aria-label="Filter trips"
            title="Filter trips"
          >
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>

          <button
            className="px-3 py-2 border rounded hover:bg-gray-50"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Close" : "New Trip +"}
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-white border rounded p-4 shadow-sm">
          <TripForm
            onSuccess={onTripCreated}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-gray-700 bg-white">
          <p className="font-medium">
            {userName ? `😔 ${userName}, ` : "😔 "}
            you don’t have any {when !== "all" ? `${when} ` : ""}trips yet.
          </p>
          <p className="text-sm mt-1">
            Add one now&nbsp;
            <button
              onClick={() => setShowCreate(true)}
              className="text-blue-600 underline"
            >
              Create trip
            </button>
            &nbsp;🥳
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((t) => (
            <li
              key={t.id}
              className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <p className="font-medium text-gray-800">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {safeYMD(t.startDate)} - {safeYMD(t.endDate)}
                  {t.destination &&
                  (t.destination.city || t.destination.country) ? (
                    <>
                      {" "}
                      · {t.destination.city || ""}
                      {t.destination.city && t.destination.country ? ", " : ""}
                      {t.destination.country || ""}
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/trips/${t.id}`}
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  View
                </Link>
                <Link
                  to={`/trips/${t.id}/edit`}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(t.id)}
                  disabled={deletingId === t.id}
                  className={`px-3 py-1 rounded text-white ${
                    deletingId === t.id
                      ? "bg-red-400"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deletingId === t.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
