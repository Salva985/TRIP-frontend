import { useAuth } from '../auth/AuthContext.jsx'
import { Outlet, NavLink, Link } from 'react-router-dom'
import HealthBadge from './common/HealthBadge.jsx'


const linkCls = ({ isActive }) =>
  `px-2 py-1 rounded ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-blue-500 hover:text-white'}`

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-blue-100 text-gray-900">
      <header className="flex items-center justify-between mb-6 bg-gray-900 text-white p-4 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold">
            <Link to="/" className="hover:underline">TRIP App</Link>
          </h1>
          <nav className="mt-3 flex items-center text-sm space-x-6">
            <NavLink to="/" end className={linkCls}>Home</NavLink>
            <NavLink to="/trips" className={linkCls}>Trips</NavLink>
            <NavLink to="/activities" className={linkCls}>Activities</NavLink>
            <NavLink to="/trips/new" className={linkCls}>New Trip</NavLink>
            <NavLink to="/activities/new" className={linkCls}>New Activity</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <HealthBadge />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-90">Hi, {user.fullName || user.username} 👋</span>
              <button onClick={logout} className="px-2 py-1 border rounded hover:bg-white hover:text-gray-900">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className={linkCls}>Login</NavLink>
              <NavLink to="/register" className={linkCls}>Register</NavLink>
            </div>
          )}
        </div>
      </header>

      <Outlet />
    </div>
  )
}