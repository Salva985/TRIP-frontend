import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { listActivities } from "../../api/activitiesApi";

export default function ActivitiesList() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const pageSize = Number(params.get("pageSize") || 10);
  const search = params.get("search") || "";

  const [q, setQ] = useState(search);
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: [],
    meta: { page, pageSize, total: 0 },
  });

  // keep input in sync with URL
  useEffect(() => setQ(search), [search]);

  // debounce search -> update URL (resets to page 1)
  useEffect(() => {
    const id = setTimeout(() => {
      setParams((p) => {
        if (q.trim()) p.set("search", q.trim());
        else p.delete("search");
        p.set("page", "1");
        p.set("pageSize", String(pageSize));
        return p;
      });
    }, 400);
    return () => clearTimeout(id);
  }, [q, pageSize, setParams]);

  // fetch from server (search/page/pageSize)
  useEffect(() => {
    let off = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    listActivities({ search, page, pageSize })
      .then((res) => {
        if (off) return;
        setState({
          loading: false,
          error: null,
          data: res.data,
          meta: res.meta,
        });
      })
      .catch((err) => {
        if (off) return;
        setState({
          loading: false,
          error: err,
          data: [],
          meta: { page, pageSize, total: 0 },
        });
      });
    return () => {
      off = true;
    };
  }, [search, page, pageSize]);

  const totalPages = useMemo(() => {
    const { total, pageSize } = state.meta;
    return Math.max(1, Math.ceil((total || 0) / (pageSize || 10)));
  }, [state.meta]);

  return (
    <section className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Search by title or type…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded px-2 py-2"
          value={pageSize}
          onChange={(e) =>
            setParams((p) => {
              p.set("page", "1");
              p.set("pageSize", e.target.value);
              return p;
            })
          }
          title="Page size"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
        <Link
          className="px-3 py-2 border rounded whitespace-nowrap"
          to="/activities/new"
        >
          + New
        </Link>
      </div>

      {/* States */}
      {state.loading && <p>Loading…</p>}
      {state.error && (
        <p className="text-red-600">
          Error: {state.error.message}
          {state.error.detail ? ` — ${state.error.detail}` : ""}
        </p>
      )}
      {!state.loading && !state.error && state.data.length === 0 && (
        <p>No results.</p>
      )}

      {/* List */}
      <ul className="divide-y border rounded bg-white">
        {state.data.map((a) => {
          const id = a.id ?? a.activityId ?? a.activityID ?? a._id;
          return (
            <li key={id} className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{a.title || `Activity #${id}`}</p>
                <p className="text-sm opacity-75">
                  {a.type} • {a.date} •{" "}
                  {a.tripName ? `Trip: ${a.tripName}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  className="px-2 py-1 border rounded"
                  to={`/activities/${id}`}
                >
                  View
                </Link>
                <Link
                  className="px-2 py-1 border rounded"
                  to={`/activities/${id}/edit`}
                >
                  Edit
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          className="px-3 py-2 border rounded disabled:opacity-50"
          onClick={() =>
            setParams((p) => {
              p.set("page", String(Math.max(1, page - 1)));
              return p;
            })
          }
          disabled={page <= 1 || state.loading}
        >
          Previous
        </button>

        <span className="text-sm">
          Page {state.meta.page} / {totalPages} &nbsp;·&nbsp; Total{" "}
          {state.meta.total}
        </span>

        <button
          className="px-3 py-2 border rounded disabled:opacity-50"
          onClick={() =>
            setParams((p) => {
              p.set("page", String(page + 1));
              return p;
            })
          }
          disabled={page >= totalPages || state.loading}
        >
          Next
        </button>
      </div>
    </section>
  );
}
