import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Outlet, NavLink, Link } from 'react-router-dom'
import HealthBadge from './common/HealthBadge.jsx'


const linkCls = ({ isActive }) =>
  `px-2 py-1 rounded ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-blue-500 hover:text-white'}`

export default function App() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);


  return (
    <div className="min-h-screen bg-blue-100 text-gray-900">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="mx-auto max-w-6xl px-3">
          <div className="flex h-14 items-center justify-between gap-3">
            {/* Left: brand + mobile menu button */}
            <div className="flex items-center gap-2">
              <Link to="/" className="text-lg font-bold hover:opacity-90">TRIP App</Link>

              {/* Mobile hamburger */}
              <button
                type="button"
                className="ml-1 inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-800 focus:outline-none sm:hidden"
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
              >
                {/* burger icon */}
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            </div>

            {/* Right: health + actions */}
            <div className="flex items-center gap-2">
              <HealthBadge className="scale-90 sm:scale-100" />

              {user ? (
                <div className="flex items-center">
                  {/* hide username on mobile, show small user icon instead */}
                  <span className="hidden sm:inline text-sm opacity-90 mr-2">Hi, {user.username} 👋</span>
                  <span className="sm:hidden mr-1" aria-hidden>{user.username}</span>

                  {/* Logout: icon on mobile, button on desktop */}
                  <button
                    onClick={logout}
                    className="sm:px-2 sm:py-1 sm:border sm:rounded sm:hover:bg-white sm:hover:text-gray-900
                               p-2 rounded hover:bg-gray-800"
                    title="Logout"
                  >
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden" aria-hidden>⌦</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <NavLink to="/login" className={linkCls}>Login</NavLink>
                  <NavLink to="/register" className={linkCls}>Register</NavLink>
                </div>
              )}
            </div>
          </div>

          {/* Desktop nav row */}
          <div className="hidden sm:flex items-center justify-between pb-3">
            <nav className="flex items-center text-sm gap-4">
              <NavLink to="/" end className={linkCls}>Home</NavLink>
              <NavLink to="/trips" className={linkCls}>Trips</NavLink>
              <NavLink to="/activities" className={linkCls}>Activities</NavLink>
              <NavLink to="/trips/new" className={linkCls}>New Trip</NavLink>
              <NavLink to="/activities/new" className={linkCls}>New Activity</NavLink>
            </nav>

          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div className={`sm:hidden ${open ? 'block' : 'hidden'} border-t border-gray-800`}>
          <div className="px-3 py-2 space-y-1">
            <NavLink to="/" end className={({ isActive }) =>
              `block rounded px-3 py-2 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-800'}`
            } onClick={() => setOpen(false)}>Home</NavLink>

            <NavLink to="/trips" className={({ isActive }) =>
              `block rounded px-3 py-2 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-800'}`
            } onClick={() => setOpen(false)}>Trips</NavLink>

            <NavLink to="/activities" className={({ isActive }) =>
              `block rounded px-3 py-2 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-800'}`
            } onClick={() => setOpen(false)}>Activities</NavLink>

            <NavLink to="/trips/new" className={({ isActive }) =>
              `block rounded px-3 py-2 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-800'}`
            } onClick={() => setOpen(false)}>New Trip</NavLink>

            <NavLink to="/activities/new" className={({ isActive }) =>
              `block rounded px-3 py-2 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-800'}`
            } onClick={() => setOpen(false)}>New Activity</NavLink>

            {/* Test Network inside mobile menu */}
            <Link
              to="#"
              className="mt-1 block rounded px-3 py-2 text-gray-200 hover:bg-gray-800"
              onClick={() => setOpen(false)}
            >
              Test Network
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-3 py-6">
        <Outlet />
      </main>
    </div>
  );
}