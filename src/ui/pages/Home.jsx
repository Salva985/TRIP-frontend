import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();
  const name = user?.fullName || user?.username || "there";

  return (
    <section className="max-w-3xl mx-auto">
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow p-6 ring-1 ring-gray-200">
        <h2 className="text-2xl font-bold">Welcome, {name}! 👋</h2>
        <p className="text-gray-600 mt-1">
          What would you like to do today?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <Link
            to="/trips"
            className="rounded-xl border bg-white hover:bg-blue-50 transition p-4 flex items-center gap-3"
          >
            <span className="text-2xl">🧳</span>
            <div>
              <p className="font-semibold">View Trips</p>
              <p className="text-sm text-gray-600">See all your trips</p>
            </div>
          </Link>

          <Link
            to="/trips/new"
            className="rounded-xl border bg-white hover:bg-green-50 transition p-4 flex items-center gap-3"
          >
            <span className="text-2xl">🛫</span>
            <div>
              <p className="font-semibold">New Trip</p>
              <p className="text-sm text-gray-600">Add a new trip</p>
            </div>
          </Link>

          <Link
            to="/activities"
            className="rounded-xl border bg-white hover:bg-indigo-50 transition p-4 flex items-center gap-3"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold">View Activities</p>
              <p className="text-sm text-gray-600">Browse all activities</p>
            </div>
          </Link>

          <Link
            to="/activities/new"
            className="rounded-xl border bg-white hover:bg-amber-50 transition p-4 flex items-center gap-3"
          >
            <span className="text-2xl">🎟️</span>
            <div>
              <p className="font-semibold">New Activity</p>
              <p className="text-sm text-gray-600">Create a new activity</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}