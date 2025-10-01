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
      {/* Heading + right tools */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Activities</h2>

        {/* right: per-page + New */}
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={pageSize}
            onChange={(e) =>
              setParams((p) => {
                p.set("page", "1");
                p.set("pageSize", e.target.value);
                return p;
              })
            }
            aria-label="Items per page"
            title="Page size"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>

          <Link
            to="/activities/new"
            className="hidden sm:inline-flex px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + New
          </Link>
        </div>
      </div>

      {/* Search row (mobile shows New here) */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <input
          className="w-full sm:w-96 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by title or type…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search activities"
        />

        <Link
          to="/activities/new"
          className="sm:hidden px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + New
        </Link>
      </div>

      {/* States */}
      {state.loading && <p>Loading…</p>}
      {state.error && (
        <p className="text-red-600">
          Error:{" "}
          {state.error.status === 401 || state.error.status === 403
            ? "Unauthorized — please login again."
            : state.error.message}
        </p>
      )}

      {!state.loading && !state.error && state.data.length === 0 && (
        <div className="rounded-lg border border-dashed p-4 text-gray-700 bg-white">
          <p className="font-medium">No activities yet.</p>
          <p className="text-sm mt-1">
            Add your first{" "}
            <Link to="/trips/new" className="text-blue-600 underline">
              trip
            </Link>
            , then create an{" "}
            <Link to="/activities/new" className="text-blue-600 underline">
              activity
            </Link>
            . 🎉
          </p>
        </div>
      )}

      {/* List as cards */}
      <ul className="space-y-3">
        {state.data.map((a) => {
          const id = a.id ?? a.activityId ?? a.activityID ?? a._id;
          return (
            <li
              key={id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {a.title || `Activity #${id}`}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {a.type} • {a.date}
                    {a.tripName ? ` • Trip: ${a.tripName}` : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                    to={`/activities/${id}`}
                  >
                    View
                  </Link>
                  <Link
                    className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                    to={`/activities/${id}/edit`}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <button
          className="px-3 py-2 border rounded disabled:opacity-50 transition"
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
          className="px-3 py-2 border rounded disabled:opacity-50 transition"
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
