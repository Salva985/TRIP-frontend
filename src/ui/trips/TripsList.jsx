// src/ui/TripsList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listTrips, deleteTrip } from "../../api/tripsApi";
import TripForm from "./TripForm";

function dateFromYMD(ymd) {
  if (!ymd || typeof ymd !== "string") return null;
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  // Use UTC to avoid timezone shifts
  return new Date(Date.UTC(y, mo - 1, d));
}

export default function TripsList() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // NEW: filter & sort UI state
  const [scope, setScope] = useState("all"); // 'all' | 'upcoming' | 'past'
  const [sort, setSort] = useState("start-asc"); // 'start-asc' | 'start-desc'

  useEffect(() => {
    let off = false;
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

  // NEW: derived list with filtering + sorting
  const view = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let filtered = trips.filter((t) => {
      if (scope === "all") return true;
      const end = dateFromYMD(t.endDate) || dateFromYMD(t.startDate);
      if (!end) return scope === "all"; // keep if unknown dates and scope=all
      const isPast = end < today;
      return scope === "past" ? isPast : !isPast; // upcoming = not past
    });

    const dir = sort === "start-desc" ? -1 : 1;
    filtered.sort((a, b) => {
      const da = dateFromYMD(a.startDate);
      const db = dateFromYMD(b.startDate);
      if (!da && !db) return 0;
      if (!da) return 1; // push undated to bottom
      if (!db) return -1;
      return (da - db) * dir;
    });

    return filtered;
  }, [trips, scope, sort]);

  if (loading) return <p>Loading trips…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">All Trips</h2>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            title="Filter"
          >
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>

          <select
            className="border rounded px-2 py-1 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            title="Sort by start date"
          >
            <option value="start-asc">Start date ↑</option>
            <option value="start-desc">Start date ↓</option>
          </select>

          <button
            className="px-3 py-2 border rounded hover:bg-gray-50"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Close" : "New Trip +"}
          </button>
        </div>
      </div>

      {/* Inline create panel */}
      {showCreate && (
        <div className="bg-white border rounded p-4 shadow-sm">
          <TripForm
            onSuccess={onTripCreated}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* List */}
      {view.length === 0 ? (
        <p className="text-gray-600">
          {scope === "upcoming"
            ? "No upcoming trips."
            : scope === "past"
            ? "No past trips."
            : "No trips yet."}
        </p>
      ) : (
        <ul className="space-y-4">
          {view.map((t) => (
            <li
              key={t.id}
              className="bg-white shadow-sm rounded-lg p-4 flex justify-between items-center border border-gray-200 hover:shadow-md transition"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {t.startDate} - {t.endDate}
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

              <div className="flex gap-2 shrink-0">
                <Link
                  to={`/trips/${t.id}`}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  View
                </Link>
                <button
                  onClick={() => onDelete(t.id)}
                  disabled={deletingId === t.id}
                  className={`px-3 py-1.5 rounded text-white ${
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
