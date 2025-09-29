import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listTrips, deleteTrip } from "../api/tripsApi";

export default function TripsList() {
  const [state, setState] = useState({ loading: true, error: null, trips: [] });

  useEffect(() => {
    let off = false;
    listTrips()
      .then(t => !off && setState({ loading: false, error: null, trips: t }))
      .catch(e => !off && setState({ loading: false, error: e, trips: [] }));
    return () => { off = true; };
  }, []);

  async function onDelete(id) {
    if (!confirm("Delete this trip?")) return;
    try {
      await deleteTrip(id);
      setState(s => ({ ...s, trips: s.trips.filter(t => t.id !== id) }));
    } catch (e) {
      alert(e.message || "Failed to delete");
    }
  }

  if (state.loading) return <p>Loading…</p>;
  if (state.error)   return <p className="text-red-600">Error: {state.error.message}</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Trips</h2>

      <ul className="divide-y border rounded">
        {state.trips.map(t => (
          <li key={t.id} className="p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{t.name || `Trip #${t.id}`}</p>
              <p className="text-sm opacity-75">
                {t.startDate} → {t.endDate}
              </p>
            </div>
            <div className="flex gap-2">
              <Link className="px-2 py-1 border rounded" to={`/trips/${t.id}`}>Open</Link>
              <button className="px-2 py-1 border rounded" onClick={() => onDelete(t.id)}>Delete</button>
              <Link className="px-2 py-1 border rounded" to={`/activities/new?tripId=${t.id}`}>+ Activity</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}