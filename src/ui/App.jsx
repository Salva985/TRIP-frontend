import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import HealthBadge from "../ui/common/HealthBadge.jsx";

const linkCls = ({ isActive }) =>
  [
    "px-3 py-1.5 rounded-md text-sm transition-colors duration-150",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
    isActive
      ? "bg-blue-600 text-white"
      : "text-gray-200 hover:bg-blue-500/80 hover:text-white",
  ].join(" ");

export default function App() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="min-h-screen bg-blue-100 text-gray-900">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Brand + desktop nav */}
            <div className="flex items-center gap-4 min-w-0">
              {/* 👇 Brand clickable link */}
              <Link
                to="/"
                className="text-2xl font-bold whitespace-nowrap hover:text-blue-400 transition-colors"
                onClick={closeMenu}>
                  TRIP App
              </Link>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-2">
                <NavLink to="/" end className={linkCls}>
                  Home
                </NavLink>
                <NavLink to="/trips" className={linkCls}>
                  Trips
                </NavLink>
                <NavLink to="/activities" className={linkCls}>
                  Activities
                </NavLink>
                <NavLink to="/trips/new" className={linkCls}>
                  New Trip
                </NavLink>
                <NavLink to="/activities/new" className={linkCls}>
                  New Activity
                </NavLink>
              </nav>
            </div>

            {/* Right side: Health + Burger */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <HealthBadge />
              </div>

              {/* Mobile burger */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:text-white hover:bg-blue-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Open menu"
                aria-controls="mobile-menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                {/* Hamburger / Close icons */}
                <svg
                  className={`h-6 w-6 ${open ? "hidden" : "block"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`h-6 w-6 ${open ? "block" : "hidden"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile panel */}
          <div
            id="mobile-menu"
            className={`md:hidden origin-top transition-all duration-200 ${
              open
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="mt-3 rounded-lg border border-white/10 bg-gray-800/70 backdrop-blur p-3 space-y-2">
              <NavLink to="/" end className={linkCls} onClick={closeMenu}>
                Home
              </NavLink>
              <NavLink to="/trips" className={linkCls} onClick={closeMenu}>
                Trips
              </NavLink>
              <NavLink to="/activities" className={linkCls} onClick={closeMenu}>
                Activities
              </NavLink>
              <NavLink to="/trips/new" className={linkCls} onClick={closeMenu}>
                New Trip
              </NavLink>
              <NavLink to="/activities/new" className={linkCls} onClick={closeMenu}>
                New Activity
              </NavLink>

              {/* Health badge visible on mobile menu */}
              <div className="pt-2 border-t border-white/10">
                <HealthBadge />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6 py-4">
        <Outlet />
      </main>
    </div>
  );
}