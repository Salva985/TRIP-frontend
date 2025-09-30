import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";

export default function Landing() {
  const { user } = useAuth();

  return (
    <section className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow ring-1 ring-gray-200 text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome to TRIP App ✈️</h1>
        <p className="text-sm text-gray-600 mb-6">
          Plan trips, track activities, and keep everything organized.
        </p>

        {!user ? (
          <div className="space-y-3">
            <Link to="/login" className="block w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">
              Login
            </Link>
            <Link to="/register" className="block w-full px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">
              Create Account
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Link to="/" className="block w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">
              Enter App
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/trips" className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">
                View Trips
              </Link>
              <Link to="/activities" className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">
                Activities
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}